import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import '../styles/Profile.css';

async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error('Choose a JPEG, PNG, or WebP image up to 5 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 384;
    const context = canvas.getContext('2d');
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 384, 384);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 384, 384);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function Profile({ onClose }) {
  const { user, apiFetch, updateUser } = useAuth();
  const [name, setName] = useState(user.fullName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [photo, setPhoto] = useState(user.profileImage || '');
  const [institution, setInstitution] = useState(user.institution || '');
  const [institutionId, setInstitutionId] = useState(user.institutionId || '');
  const [institutions, setInstitutions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const institutionChanged = institution !== user.institution;
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInput = useRef(null);
  const dialogRef = useRef(null);
  const role = user.role === 'professor' ? 'Professor' : 'Student';

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const handleKeys = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]):not([hidden]), textarea:not([disabled]), select:not([disabled]), a[href]')]
        .filter(element => element.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', handleKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeys);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (!institutionChanged || institutionId || institution.trim().length < 2) {
      setInstitutions([]); setSearching(false); setSearchError('');
      return undefined;
    }
    const controller = new AbortController();
    setSearching(true); setSearchError(''); setInstitutions([]);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(`/api/institutions?query=${encodeURIComponent(institution.trim())}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error('Institution search is unavailable. Please try again.');
        if (!controller.signal.aborted) setInstitutions(data.institutions || []);
      } catch (err) {
        if (!controller.signal.aborted) setSearchError(err.message);
      } finally { if (!controller.signal.aborted) setSearching(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [apiFetch, institution, institutionChanged, institutionId]);

  const selectPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(''); setSuccess(''); setProcessing(true);
    try { setPhoto(await preparePhoto(file)); }
    catch (err) { setError(err.message || 'This image could not be opened.'); }
    finally { setProcessing(false); }
  };

  const save = async (event) => {
    event.preventDefault();
    if (busy || processing) return;
    if (institutionChanged && (!institutionId || !confirmed)) {
      setError('Select an institution from the results and acknowledge the connection changes before saving.');
      return;
    }
    setBusy(true); setError(''); setSuccess('');
    try {
      const response = await apiFetch('/api/auth/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, bio, profileImage: photo, institution, institutionId, confirmInstitutionChange: confirmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not save your profile. Please try again.');
      updateUser(data.user);
      setName(data.user.fullName); setBio(data.user.bio); setPhoto(data.user.profileImage);
      setInstitution(data.user.institution); setInstitutionId(data.user.institutionId || ''); setConfirmed(false);
      setSuccess(data.institutionChanged ? 'Profile saved. Previous connections have ended and conversations are closed. You can now connect at your new institution.' : 'Your profile has been saved.');
    } catch (err) { setError(err.message || 'Could not save your profile.'); }
    finally { setBusy(false); }
  };

  return createPortal(<div className="profile-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
  <section className="workspace-section profile-page" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="profile-title" tabIndex={-1}>
    <button type="button" className="profile-close" onClick={onClose} aria-label="Close profile">×</button>
    <p className="dashboard-eyebrow">Your account</p>
    <h1 id="profile-title">{role} profile</h1>
    <p className="dashboard-subtext">Add a photo and a short introduction to make your profile your own.</p>
    {error && <p className="login-alert" role="alert">{error}</p>}
    {success && <p className="login-success" role="status">{success}</p>}
    <form onSubmit={save}>
      <fieldset disabled={busy || processing}>
        <legend className="sr-only">Edit your profile</legend>
        <div className="profile-photo-section">
          {photo ? <img className="profile-photo" src={photo} alt="Profile preview" /> : <div className="profile-photo profile-photo--initials" aria-label="No profile photo">{name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
          <div><div className="profile-photo-actions">
            <button type="button" className="dashboard-action" onClick={() => fileInput.current?.click()}>{processing ? 'Preparing photo…' : 'Choose photo'}</button>
            {photo && <button type="button" onClick={() => { setPhoto(''); setSuccess(''); }}>Remove photo</button>}
          </div><p>JPEG, PNG, or WebP · Up to 5 MB. Photos are cropped to a square.</p></div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} hidden />
        </div>
        <div className="profile-fields">
          <label>Full name<input required maxLength={100} autoComplete="name" value={name} onChange={event => { setName(event.target.value); setSuccess(''); }} /></label>
          <div className="profile-institution">
            <label htmlFor="profile-institution">School / institution</label>
            <input id="profile-institution" required maxLength={300} autoComplete="off" value={institution} aria-describedby="institution-help" onChange={event => { setInstitution(event.target.value); setInstitutionId(''); setConfirmed(false); setSuccess(''); }} />
            <small id="institution-help">Type at least two characters and select your school from the directory.</small>
            {searching && <p role="status">Searching institutions…</p>}
            {searchError && <p role="alert">{searchError}</p>}
            {institutions.length > 0 && <ul className="profile-institution-results" aria-label="Institution results">{institutions.map(item => <li key={item.id}><button type="button" onClick={() => { setInstitution(item.name); setInstitutionId(item.id); setInstitutions([]); setConfirmed(false); }}>{item.name}</button></li>)}</ul>}
            {institutionChanged && !institutionId && !searching && !searchError && institution.trim().length >= 2 && institutions.length === 0 && <p role="status">No matching institutions. Try another search.</p>}
            {institutionChanged && <div className="profile-institution-notice"><p>Changing schools ends all current connections and pending requests. Existing conversations will close and their history will be retained. Connecting again requires a new request and approval.</p><label><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I understand and want to change my institution.</label></div>}
          </div>
          <label>Bio<textarea maxLength={500} rows={5} placeholder={user.role === 'professor' ? 'A short introduction to your teaching and academic interests…' : 'A short introduction to yourself and your interests…'} value={bio} onChange={event => { setBio(event.target.value); setSuccess(''); }} /><small>{bio.length}/500 characters</small></label>
        </div>
        <dl className="profile-account-details"><div><dt>Account type</dt><dd>{role}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Institution</dt><dd>{user.institution || 'Not specified'}</dd></div></dl>
        <button className="dashboard-action" type="submit">{busy ? 'Saving…' : 'Save profile'}</button>
      </fieldset>
    </form>
  </section></div>, document.body);
}
