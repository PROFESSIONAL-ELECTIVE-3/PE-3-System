const axios = require('axios');

// CHED's public HEI directory is grouped by regional office. These are the
// directory's current region IDs, not IDs supplied by a user request.
const CHED_REGION_IDS = [19, 14, 17, 13, 18, 1, 2, 3, 4, 9, 5, 6, 7, 8, 10, 11, 12, 16];
const CHED_DIRECTORY_URL = 'https://heida.ched.gov.ph/hei-directory';
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_RESULTS = 50;
const cache = new Map();

// Some city universities are not yet present in CHED's HEIDA directory. Keep
// these verified local-government institutions available until CHED publishes
// their records in the directory.
const VERIFIED_LOCAL_INSTITUTIONS = [
  {
    id: 'city-manila-plm',
    name: 'Pamantasan ng Lungsod ng Maynila',
    aliases: ['PLM', 'University of the City of Manila'],
    source: 'City of Manila',
  },
  {
    id: 'city-manila-udm',
    name: 'Universidad de Manila',
    aliases: ['UdM', 'City College of Manila', 'Dalubhasaan ng Lungsod ng Maynila'],
    source: 'City of Manila',
  },
];

const decodeHtml = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

const extractInstitutions = (html) => {
  const institutions = [];
  const pattern = /leading-tight">([^<]+)<\/span>\s*<span[^>]*font-mono[^>]*>([^<]+)<\/span>/g;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    institutions.push({
      id: decodeHtml(match[2]),
      name: decodeHtml(match[1]),
      source: 'CHED HEIDA',
    });
  }

  return institutions;
};

const matchesQuery = (institution, query) => [institution.name, ...(institution.aliases || [])]
  .some((value) => value.toLocaleLowerCase('en-US').includes(query));

// @desc    Search CHED's public Higher Education Institution directory
// @route   GET /api/institutions?query=...
// @access  Public
exports.searchInstitutions = async (req, res, next) => {
  const query = String(req.query.query || '').trim();
  if (query.length < 2) {
    return res.status(200).json({ institutions: [] });
  }

  const cacheKey = query.toLocaleLowerCase('en-US');
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({ institutions: cached.institutions });
  }

  try {
    const responses = await Promise.all(
      CHED_REGION_IDS.map((regionId) => axios.get(`${CHED_DIRECTORY_URL}/${regionId}`, {
        params: { search: query },
        timeout: 8000,
        responseType: 'text',
      }))
    );

    const byId = new Map();
    const localMatches = VERIFIED_LOCAL_INSTITUTIONS.filter((institution) => matchesQuery(institution, cacheKey));
    [...responses.flatMap((response) => extractInstitutions(response.data)), ...localMatches].forEach((institution) => {
      byId.set(institution.id, institution);
    });

    const institutions = [...byId.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS)
      .map(({ id, name, source }) => ({ id, name, source }));

    cache.set(cacheKey, { institutions, expiresAt: Date.now() + CACHE_TTL_MS });
    res.status(200).json({ institutions });
  } catch (error) {
    next(error);
  }
};
