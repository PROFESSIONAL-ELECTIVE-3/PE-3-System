import { useState } from 'react';

export default function ProfileAvatar({ person, className = '' }) {
  const [failedImage, setFailedImage] = useState(null);
  const photo = person?.profileImage;
  return <span className={`connection-avatar profile-avatar ${className}`} aria-hidden="true">
    {photo && failedImage !== photo
      ? <img src={photo} alt="" onError={() => setFailedImage(photo)} />
      : String(person?.fullName || '?').trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}
  </span>;
}
