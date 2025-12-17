"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function UserDetailModal({ id, onClose }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({}); // Separate state for file errors
  
  // Simplified image state
  const [images, setImages] = useState({
    user: {
      profile: { url: null, file: null },
      poster: { url: null, file: null },
      anniversary: { url: null, file: null }
    },
    partner: {
      profile: { url: null, file: null },
      poster: { url: null, file: null },
      anniversary: { url: null, file: null }
    }
  });

  // Combined loading states for downloads
  const [downloadStates, setDownloadStates] = useState({
    user: {
      profile: false,
      poster: false,
      anniversary: false
    },
    partner: {
      profile: false,
      poster: false,
      anniversary: false
    }
  });

  // Helper function to construct image URLs
  const getImageUrl = (userId, type = 'profile') => {
    let filename = userId;
    if (type === 'poster') filename += '_poster.jpg';
    else if (type === 'anniversary') filename += '_anniv.jpg';
    else filename += '.jpg';
    
    return `/api/profile/image?filename=${filename}&cacheBust=${Date.now()}`;
  };

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) return "Name is required";
    if (name.trim().length > 100) return "Name must be less than 100 characters";
    const nameRegex = /^[A-Za-z][A-Za-z .'-]*$/;
    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, dots, apostrophes and hyphens, and must start with a letter";
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) return null; // Phone is optional
    const phoneRegex = /^(\+91)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return "Phone must be 10 digits (with optional +91 prefix)";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) return null; // Email is optional
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateImage = (file, type = 'profile') => {
    if (!file) return null;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return "File must be an image";
    }
    
    // Check file size based on type
    if (type === 'profile' && file.size > 50 * 1024) { // 50KB
      return "Profile image must be under 50KB";
    }
    
    if ((type === 'poster' || type === 'anniversary') && file.size > 2.5 * 1024 * 1024) { // 2.5MB
      return "Poster must be under 2.5MB";
    }
    
    return null;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const newFileErrors = {};
    
    // Validate user fields
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    // Validate partner fields if exists
    if (formData.partner) {
      const partnerNameError = validateName(formData.partner.name);
      if (partnerNameError) newErrors['partner.name'] = partnerNameError;
      
      const partnerPhoneError = validatePhone(formData.partner.phone);
      if (partnerPhoneError) newErrors['partner.phone'] = partnerPhoneError;
      
      const partnerEmailError = validateEmail(formData.partner.email);
      if (partnerEmailError) newErrors['partner.email'] = partnerEmailError;
    }
    
    // Validate images - store in fileErrors
    if (images.user.profile.file) {
      const profileError = validateImage(images.user.profile.file, 'profile');
      if (profileError) newFileErrors['user.profile'] = profileError;
    }
    
    if (images.user.poster.file) {
      const posterError = validateImage(images.user.poster.file, 'poster');
      if (posterError) newFileErrors['user.poster'] = posterError;
    }
    
    if (images.user.anniversary.file) {
      const annivError = validateImage(images.user.anniversary.file, 'anniversary');
      if (annivError) newFileErrors['user.anniversary'] = annivError;
    }
    
    if (formData.partner) {
      if (images.partner.profile.file) {
        const profileError = validateImage(images.partner.profile.file, 'profile');
        if (profileError) newFileErrors['partner.profile'] = profileError;
      }
      
      if (images.partner.poster.file) {
        const posterError = validateImage(images.partner.poster.file, 'poster');
        if (posterError) newFileErrors['partner.poster'] = posterError;
      }
      
      if (images.partner.anniversary.file) {
        const annivError = validateImage(images.partner.anniversary.file, 'anniversary');
        if (annivError) newFileErrors['partner.anniversary'] = annivError;
      }
    }
    
    setErrors(newErrors);
    setFileErrors(newFileErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newFileErrors).length === 0;
  };

  useEffect(() => {
    if (id) {
      // Reset all image URLs when id changes
      setImages({
        user: {
          profile: { url: null, file: null },
          poster: { url: null, file: null },
          anniversary: { url: null, file: null }
        },
        partner: {
          profile: { url: null, file: null },
          poster: { url: null, file: null },
          anniversary: { url: null, file: null }
        }
      });
      setErrors({});
      setFileErrors({});
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/user?id=${id}`);
        const data = await res.json();

        if (cancelled) return;

        setUser(data);
        setFormData(JSON.parse(JSON.stringify(data)));
        setErrors({});
        setFileErrors({});

        // Set image URLs directly
        setImages({
          user: {
            profile: { url: getImageUrl(data.id), file: null },
            poster: { url: getImageUrl(data.id, 'poster'), file: null },
            anniversary: { url: getImageUrl(data.id, 'anniversary'), file: null }
          },
          partner: data.partner?.id ? {
            profile: { url: getImageUrl(data.partner.id), file: null },
            poster: { url: getImageUrl(data.partner.id, 'poster'), file: null },
            anniversary: { url: getImageUrl(data.partner.id, 'anniversary'), file: null }
          } : {
            profile: { url: null, file: null },
            poster: { url: null, file: null },
            anniversary: { url: null, file: null }
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchUserData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleImageSelect = (e, isUser, isProfile = true) => {
    if (isLoading) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate image
    const error = validateImage(file, isProfile ? 'profile' : 'poster');
    
    const type = isProfile ? 'profile' : 'poster';
    const fieldKey = `${isUser ? 'user' : 'partner'}.${type}`;
    
    if (error) {
      setFileErrors(prev => ({ ...prev, [fieldKey]: error }));
      e.target.value = ''; // Clear the file input
      
      // Clear the image from state if there's an error
      setImages(prev => ({
        ...prev,
        [isUser ? 'user' : 'partner']: {
          ...prev[isUser ? 'user' : 'partner'],
          [type]: { url: null, file: null }
        }
      }));
      return;
    }
    
    const url = URL.createObjectURL(file);
    
    setImages(prev => ({
      ...prev,
      [isUser ? 'user' : 'partner']: {
        ...prev[isUser ? 'user' : 'partner'],
        [type]: { url, file }
      }
    }));
    
    // Clear any previous error for this field
    setFileErrors(prev => {
      const newFileErrors = { ...prev };
      delete newFileErrors[fieldKey];
      return newFileErrors;
    });
  };

  const handlePosterSelect = (e, isUser, isAnniversary = false) => {
    if (isLoading) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate poster
    const type = isAnniversary ? 'anniversary' : 'poster';
    const fieldKey = `${isUser ? 'user' : 'partner'}.${type}`;
    const error = validateImage(file, isAnniversary ? 'anniversary' : 'poster');
    
    if (error) {
      setFileErrors(prev => ({ ...prev, [fieldKey]: error }));
      e.target.value = ''; // Clear the file input
      
      // Clear the image from state if there's an error
      setImages(prev => ({
        ...prev,
        [isUser ? 'user' : 'partner']: {
          ...prev[isUser ? 'user' : 'partner'],
          [type]: { url: null, file: null }
        }
      }));
      return;
    }
    
    const url = URL.createObjectURL(file);
    
    setImages(prev => ({
      ...prev,
      [isUser ? 'user' : 'partner']: {
        ...prev[isUser ? 'user' : 'partner'],
        [type]: { url, file }
      }
    }));
    
    // Clear any previous error for this field
    setFileErrors(prev => {
      const newFileErrors = { ...prev };
      delete newFileErrors[fieldKey];
      return newFileErrors;
    });
  };

  const handleDownload = async (userId, isUser = true, type = 'profile') => {
    try {
      setIsLoading(true);
      setDownloadStates(prev => ({
        ...prev,
        [isUser ? 'user' : 'partner']: {
          ...prev[isUser ? 'user' : 'partner'],
          [type]: true
        }
      }));

      const endpoint = type === 'profile' ? "/api/profile/download" : "/api/poster/download";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: userId,
          category: type === 'anniversary' ? 'anniversary' : undefined
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName || `${userId}${type === 'poster' ? '_poster.jpg' : type === 'anniversary' ? '_anniv.jpg' : '.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // Show inline error instead of alert
      setErrors(prev => ({ ...prev, download: `${type === 'profile' ? 'Profile' : 'Poster'} download failed` }));
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.download;
          return newErrors;
        });
      }, 3000);
    } finally {
      setDownloadStates(prev => ({
        ...prev,
        [isUser ? 'user' : 'partner']: {
          ...prev[isUser ? 'user' : 'partner'],
          [type]: false
        }
      }));
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, isUser, type = 'profile') => {
    if (isLoading) return;

    const confirmed = window.confirm(`Are you sure you want to delete this ${type} image?`);
    if (!confirmed) return;

    try {
      setIsLoading(true);

      const endpoint = type === "profile" ? "/api/profile/delete" : "/api/poster/delete";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          category: type === "anniversary" ? "anniversary" : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete");

      // Success: close modal
      onClose();
    } catch (err) {
      console.error(err);
      // Show inline error instead of alert
      setErrors(prev => ({ ...prev, delete: "Delete failed" }));
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.delete;
          return newErrors;
        });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to top to show first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      // Save user data
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save");

      // Prepare all uploads
      const uploads = [];

      // User uploads
      if (images.user.profile.file) {
        const f = new FormData();
        f.append("file", images.user.profile.file);
        f.append("id", user.id);
        uploads.push(() => fetch("/api/profile/upload", { method: "POST", body: f }));
      }

      if (images.user.poster.file) {
        const f = new FormData();
        f.append("file", images.user.poster.file);
        f.append("id", user.id);
        uploads.push(() => fetch("/api/poster/upload", { method: "POST", body: f }));
      }

      if (images.user.anniversary.file) {
        const f = new FormData();
        f.append("file", images.user.anniversary.file);
        f.append("id", user.id);
        f.append("category", "anniversary");
        uploads.push(() => fetch("/api/poster/upload", { method: "POST", body: f }));
      }

      // Partner uploads
      if (user.partner?.id) {
        if (images.partner.profile.file) {
          const f = new FormData();
          f.append("file", images.partner.profile.file);
          f.append("id", user.partner.id);
          uploads.push(() => fetch("/api/profile/upload", { method: "POST", body: f }));
        }

        if (images.partner.poster.file) {
          const f = new FormData();
          f.append("file", images.partner.poster.file);
          f.append("id", user.partner.id);
          uploads.push(() => fetch("/api/poster/upload", { method: "POST", body: f }));
        }

        if (images.partner.anniversary.file) {
          const f = new FormData();
          f.append("file", images.partner.anniversary.file);
          f.append("id", user.partner.id);
          f.append("category", "anniversary");
          uploads.push(() => fetch("/api/poster/upload", { method: "POST", body: f }));
        }
      }

      // Execute uploads one-by-one
      for (const upload of uploads) {
        try {
          await upload();
        } catch (err) {
          console.error("One of the uploads failed:", err);
          throw new Error("Upload failed");
        }
      }

      onClose();
    } catch (err) {
      console.error(err);
      // Show inline error instead of alert
      setErrors(prev => ({ ...prev, submit: "Submit failed" }));
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.submit;
          return newErrors;
        });
      }, 3000);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleInputChange = (path, value) => {
    if (isLoading) return;
    
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let obj = newData;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys.at(-1)] = value;
      return newData;
    });
    
    // Clear error for this field when user starts typing
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[path];
      return newErrors;
    });
  };

  const renderImage = (imageData, alt, userId, isUser = true) => {
    const fieldKey = `${isUser ? 'user' : 'partner'}.profile`;
    const fileError = fileErrors[fieldKey];
    
    return (
      <div className="text-center w-24">
        <label className="block cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={(e) => handleImageSelect(e, isUser, true)} 
            disabled={isLoading}
          />
          <div className={`w-24 h-24 border rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ${fileError ? 'border-red-500' : ''}`}>
            {imageData.url ? (
              <Image 
                src={imageData.url} 
                alt={alt} 
                width={96} 
                height={96} 
                className="object-cover"
                unoptimized
                onError={(e) => {
                  setImages(prev => ({
                    ...prev,
                    [isUser ? 'user' : 'partner']: {
                      ...prev[isUser ? 'user' : 'partner'],
                      profile: { url: null, file: null }
                    }
                  }));
                }}
              />
            ) : <span className="text-xs">No Image</span>}
          </div>
        </label>
        <div className="mt-2 text-xs">
          <div><strong>ID:</strong> {userId}</div>
          <label className="flex justify-center items-center gap-1 mt-1">
            <input 
              type="checkbox" 
              checked={isUser ? formData.active : formData.partner?.active}
              onChange={(e) => handleInputChange(isUser ? "active" : "partner.active", e.target.checked)} 
              disabled={isLoading}
            />
            Active
          </label>
          <button 
            type="button" 
            onClick={() => handleDownload(userId, isUser, 'profile')} 
            disabled={!imageData.url || isLoading || downloadStates[isUser ? 'user' : 'partner'].profile}
            className="mt-1 px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {downloadStates[isUser ? 'user' : 'partner'].profile ? "Downloading..." : "Download"}
          </button>
          <button 
            type="button" 
            onClick={() => handleDelete(userId, isUser, 'profile')} 
            disabled={!imageData.url || isLoading || downloadStates[isUser ? 'user' : 'partner'].profile}
            className="mt-1 px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            Delete Profile
          </button>
          {fileError && (
            <div className="mt-1 text-red-500 text-xs">{fileError}</div>
          )}
        </div>
      </div>
    );
  };

  const renderPoster = (posterData, alt, userId, isUser = true, isAnniversary = false) => {
    const type = isAnniversary ? 'anniversary' : 'poster';
    const fieldKey = `${isUser ? 'user' : 'partner'}.${type}`;
    const fileError = fileErrors[fieldKey];
    
    let fallbackLabel = "No poster";
    if (isAnniversary) fallbackLabel = "Anniversary Poster";
    else fallbackLabel = "Birthday Poster";

    return (
      <div className="text-center w-32">
        <label className="block cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={(e) => handlePosterSelect(e, isUser, isAnniversary)} 
            disabled={isLoading}
          />
          <div className={`w-32 h-48 border rounded-md bg-gray-100 flex items-center justify-center overflow-hidden ${fileError ? 'border-red-500' : ''}`}>
            {posterData.url ? (
              <Image 
                src={posterData.url} 
                alt={alt} 
                width={128} 
                height={192} 
                className="object-cover"
                unoptimized
                onError={(e) => {
                  setImages(prev => ({
                    ...prev,
                    [isUser ? 'user' : 'partner']: {
                      ...prev[isUser ? 'user' : 'partner'],
                      [type]: { url: null, file: null }
                    }
                  }));
                }}
              />
            ) : <span className="text-xs">{fallbackLabel}</span>}
        </div>
        </label>
        <button 
          type="button" 
          onClick={() => handleDownload(userId, isUser, type)} 
          disabled={!posterData.url || isLoading || downloadStates[isUser ? 'user' : 'partner'][type]}
          className="mt-2 text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {downloadStates[isUser ? 'user' : 'partner'][type] ? "Downloading..." : "Download"}
        </button>
        <button 
          type="button" 
          onClick={() => handleDelete(userId, isUser, type)} 
          disabled={!posterData.url || isLoading || downloadStates[isUser ? 'user' : 'partner'][type]}
          className="mt-1 px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete Poster
        </button>
        {fileError && (
          <div className="mt-1 text-red-500 text-xs">{fileError}</div>
        )}
      </div>
    );
  };

  const renderDateInputs = (path) => {
    const value = path.split(".").reduce((acc, key) => acc?.[key], formData) || "";
    const [, month = "", day = ""] = value.split("-");
    const months = [...Array(12)].map((_, i) => i + 1);
    const days = [...Array(31)].map((_, i) => i + 1);
    return (
      <div className="flex gap-2">
        <select 
          value={+day || ""} 
          onChange={(e) => updateDate("day", e.target.value)} 
          className="w-1/2 border p-1 rounded text-sm"
          disabled={isLoading}
        >
          <option value="">Day</option>{days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select 
          value={+month || ""} 
          onChange={(e) => updateDate("month", e.target.value)} 
          className="w-1/2 border p-1 rounded text-sm"
          disabled={isLoading}
        >
          <option value="">Month</option>{months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    );
    function updateDate(part, val) {
      const [year = "2000", m = "01", d = "01"] = value.split("-");
      const newDate = `${year}-${part === "month" ? val.padStart(2, "0") : m}-${part === "day" ? val.padStart(2, "0") : d}`;
      handleInputChange(path, newDate);
    }
  };

  if (!id || !user || !formData) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full h-full relative shadow-lg overflow-y-auto pb-6">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl" disabled={isLoading}>✕</button>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          {isLoading && <div className="text-sm text-blue-600">Processing...</div>}
        </div>

        {/* Global error messages */}
        {(errors.download || errors.delete || errors.submit) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-red-700 text-sm">
              {errors.download && <div>{errors.download}</div>}
              {errors.delete && <div>{errors.delete}</div>}
              {errors.submit && <div>{errors.submit}</div>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-sm">
          {/* USER ROW */}
          <div className="space-y-4 sm:grid sm:grid-cols-8 sm:gap-4 sm:items-start">
            {/* Profile image */}
            <div className="flex justify-center sm:block sm:col-span-1">
              {renderImage(images.user.profile, "User", user.id, true)}
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 gap-3 sm:col-span-4 sm:grid-cols-3">
              <Input 
                label="Name" 
                path="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                disabled={isLoading}
                error={errors.name}
                required
              />
              <Select 
                label="Role" 
                path="role" 
                value={formData.role} 
                onChange={handleInputChange}
                options={["District Team", "Influencer President", "Influencer Secretary"]} 
                disabled={isLoading}
              />
              <Select 
                label="Type" 
                path="type" 
                value={formData.type} 
                onChange={handleInputChange}
                options={["member", "spouse"]} 
                disabled={isLoading}
              />
              <Input 
                label="Club" 
                path="club" 
                value={formData.club} 
                onChange={handleInputChange} 
                disabled={isLoading}
              />
              <Input 
                label="Email" 
                path="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                disabled={isLoading}
                error={errors.email}
                type="email"
              />
              <Input 
                label="Phone" 
                path="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                disabled={isLoading}
                error={errors.phone}
                type="tel"
              />
              <div><Label text="DOB" />{renderDateInputs("dob")}</div>
              <div><Label text="Anniversary" />{renderDateInputs("anniversary")}</div>
            </div>

            {/* Posters - horizontal scroll on mobile */}
            <div className="flex gap-4 overflow-x-auto sm:col-span-3 sm:flex-none sm:grid sm:grid-cols-2">
              {renderPoster(images.user.poster, "User Poster", user.id, true)}
              {formData.type === "member" && renderPoster(images.user.anniversary, "User Anniv Poster", user.id, true, true)}
            </div>
          </div>

          {/* PARTNER ROW */}
          {formData.partner && (
            <div className="space-y-4 sm:grid sm:grid-cols-8 sm:gap-4 sm:items-start">
              {/* Profile image */}
              <div className="flex justify-center sm:block sm:col-span-1">
                {renderImage(images.partner.profile, "Partner", formData.partner.id, false)}
              </div>

              {/* Partner form fields */}
              <div className="grid grid-cols-1 gap-3 sm:col-span-4 sm:grid-cols-3">
                <Input 
                  label="Name" 
                  path="partner.name" 
                  value={formData.partner.name} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                  error={errors['partner.name']}
                  required
                />
                <Select 
                  label="Role" 
                  path="partner.role" 
                  value={formData.partner.role} 
                  onChange={handleInputChange}
                  options={["District Team", "Influencer President", "Influencer Secretary"]} 
                  disabled={isLoading}
                />
                <Select 
                  label="Type" 
                  path="partner.type" 
                  value={formData.partner.type} 
                  onChange={handleInputChange}
                  options={["member", "spouse"]} 
                  disabled={isLoading}
                />
                <Input 
                  label="Club" 
                  path="partner.club" 
                  value={formData.partner.club} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                />
                <Input 
                  label="Email" 
                  path="partner.email" 
                  value={formData.partner.email} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                  error={errors['partner.email']}
                  type="email"
                />
                <Input 
                  label="Phone" 
                  path="partner.phone" 
                  value={formData.partner.phone} 
                  onChange={handleInputChange} 
                  disabled={isLoading}
                  error={errors['partner.phone']}
                  type="tel"
                />
                <div><Label text="DOB" />{renderDateInputs("partner.dob")}</div>
              </div>

              {/* Partner posters */}
              <div className="flex gap-4 overflow-x-auto sm:col-span-3 sm:flex-none sm:grid sm:grid-cols-2">
                {renderPoster(images.partner.poster, "Partner Poster", formData.partner.id, false)}
                {formData.partner.type === "member" && renderPoster(images.partner.anniversary, "Partner Anniv Poster", formData.partner.id, false, true)}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="text-center pt-4 sticky bottom-0 bg-white py-2">
            <button type="submit" disabled={isSubmitting || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto">
              {isSubmitting ? "Updating..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Input = ({ label, path, value, onChange, disabled, error, type = "text", required = false }) => (
  <div>
    <Label text={label} required={required} />
    <input 
      type={type}
      value={value || ""} 
      onChange={(e) => onChange(path, e.target.value)}
      className={`border rounded p-1 w-full disabled:opacity-60 ${error ? 'border-red-500' : ''}`} 
      disabled={disabled}
    />
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

const Select = ({ label, path, value, onChange, options = [], disabled }) => (
  <div>
    <Label text={label} />
    <select 
      value={value || ""} 
      onChange={(e) => onChange(path, e.target.value)}
      className="border rounded p-1 w-full disabled:opacity-60"
      disabled={disabled}
    >
      <option value="">--Select--</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Label = ({ text, required = false }) => (
  <label className="block mb-1 font-medium text-gray-700">
    {text}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);