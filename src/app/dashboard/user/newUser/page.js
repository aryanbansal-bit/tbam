'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonForm() {
  const router = useRouter();
  const [anniversary, setAnniversary] = useState({ day: '', month: '' });
  const [person1, setPerson1] = useState(defaultPerson());
  const [person2, setPerson2] = useState(defaultPerson());
  const [errors, setErrors] = useState({ 
    person1: {}, 
    person2: {}, 
    anniversary: {},
    global: null 
  });
  const [submitting, setSubmitting] = useState(false);

  function defaultPerson() {
    return {
      name: '',
      club: '',
      email: '',
      phone: '',
      usertype: 'member',
      role: "District Team",
      dob: { day: '', month: '' },
      image: null,
    };
  }

  // Validation functions - Person 1 name is required, Person 2 name is optional
  const validateName = (name, isPerson1 = true) => {
    if (isPerson1) {
      // Person 1: Name is required
      if (!name || name.trim().length === 0) return "Name is required";
    } else {
      // Person 2: Name is optional, only validate if provided
      if (!name || name.trim().length === 0) return null;
    }
    
    // Common constraints for both (if name is provided)
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

  const validateImage = (file, isProfile = true) => {
    if (!file) return null;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return "File must be an image";
    }
    
    // Check file size - profile: 50KB, poster: 2.5MB
    if (isProfile && file.size > 50 * 1024) { // 50KB
      return "Profile image must be under 50KB";
    }
    
    if (!isProfile && file.size > 2.5 * 1024 * 1024) { // 2.5MB
      return "Image must be under 2.5MB";
    }
    
    return null;
  };

  const validateDate = (day, month, fieldName = 'Date') => {
    // Date is optional, only validate if at least one part is provided
    if ((day && !month) || (!day && month)) {
      return `${fieldName} requires both day and month`;
    }
    
    if (!day && !month) return null; // Both empty is OK
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return `${fieldName} day must be between 1-31`;
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return `${fieldName} month must be between 1-12`;
    return null;
  };

  const validatePerson = (person, isPerson1 = true) => {
    const personErrors = {};
    
    // Person 1 name is required, Person 2 name is optional
    const nameError = validateName(person.name, isPerson1);
    if (nameError) personErrors.name = nameError;
    
    // Phone is optional, only validate if provided
    const phoneError = validatePhone(person.phone);
    if (phoneError) personErrors.phone = phoneError;
    
    // Email is optional, only validate if provided
    const emailError = validateEmail(person.email);
    if (emailError) personErrors.email = emailError;
    
    // Date of Birth is optional, only validate if partially filled
    const dobError = validateDate(person.dob.day, person.dob.month, 'Date of Birth');
    if (dobError) personErrors.dob = dobError;
    
    // Image is optional, only validate if provided
    const imageError = validateImage(person.image, true);
    if (imageError) personErrors.image = imageError;
    
    // Club is optional, no validation needed
    
    return personErrors;
  };

  const validateForm = () => {
    const newErrors = {
      person1: {},
      person2: {},
      anniversary: {},
      global: null
    };
    
    // Validate Person 1 (name is required)
    const person1Errors = validatePerson(person1, true);
    newErrors.person1 = person1Errors;
    
    // Validate Person 2 (name is optional)
    const person2Errors = validatePerson(person2, false);
    newErrors.person2 = person2Errors;
    
    // Validate anniversary - optional, only validate if provided
    if (anniversary.day || anniversary.month) {
      const anniversaryError = validateDate(anniversary.day, anniversary.month, 'Anniversary');
      if (anniversaryError) newErrors.anniversary.date = anniversaryError;
    }
    
    setErrors(newErrors);
    
    // Check if there are any constraint errors
    const hasErrors = 
      Object.keys(newErrors.person1).length > 0 ||
      Object.keys(newErrors.person2).length > 0 ||
      Object.keys(newErrors.anniversary).length > 0;
    
    return !hasErrors;
  };

  const formatDate = (day, month) => {
    if (!day || !month) return '';
    const paddedDay = String(day).padStart(2, '0');
    const paddedMonth = String(month).padStart(2, '0');
    return `2000-${paddedMonth}-${paddedDay}`;
  };

  const handleDateChange = (e, person) => {
    const { name, value } = e.target;
    let numericValue = value.replace(/\D/g, '');
    if (name === 'day' && numericValue > 31) numericValue = '31';
    if (name === 'month' && numericValue > 12) numericValue = '12';

    const safeValue = numericValue.toString();

    if (person === 'anniversary') {
      setAnniversary((prev) => ({ ...prev, [name]: safeValue }));
      // Clear anniversary error when user types
      setErrors(prev => ({
        ...prev,
        anniversary: { ...prev.anniversary, date: null }
      }));
    } else if (person === 'person1') {
      setPerson1((prev) => ({
        ...prev,
        dob: { ...prev.dob, [name]: safeValue },
      }));
      // Clear dob error when user types
      setErrors(prev => ({
        ...prev,
        person1: { ...prev.person1, dob: null }
      }));
    } else {
      setPerson2((prev) => ({
        ...prev,
        dob: { ...prev.dob, [name]: safeValue },
      }));
      // Clear dob error when user types
      setErrors(prev => ({
        ...prev,
        person2: { ...prev.person2, dob: null }
      }));
    }
  };

  const handlePersonChange = (e, person) => {
    const { name, value } = e.target;
    if (person === 'person1') {
      setPerson1((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user types
      setErrors(prev => ({
        ...prev,
        person1: { ...prev.person1, [name]: null }
      }));
    } else {
      setPerson2((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user types
      setErrors(prev => ({
        ...prev,
        person2: { ...prev.person2, [name]: null }
      }));
    }
  };

  const handleImageChange = (e, person) => {
    const file = e.target.files[0];
    if (!file) {
      // Clear image when no file selected
      if (person === 'person1') {
        setPerson1(prev => ({ ...prev, image: null }));
        setErrors(prev => ({ ...prev, person1: { ...prev.person1, image: null } }));
      } else {
        setPerson2(prev => ({ ...prev, image: null }));
        setErrors(prev => ({ ...prev, person2: { ...prev.person2, image: null } }));
      }
      return;
    }

    // Validate image
    const imageError = validateImage(file, true);
    
    if (imageError) {
      if (person === 'person1') {
        setErrors(prev => ({ ...prev, person1: { ...prev.person1, image: imageError } }));
        setPerson1(prev => ({ ...prev, image: null }));
      } else {
        setErrors(prev => ({ ...prev, person2: { ...prev.person2, image: imageError } }));
        setPerson2(prev => ({ ...prev, image: null }));
      }
      e.target.value = ''; // Clear the file input
      return;
    }

    // Clear any previous error
    if (person === 'person1') {
      setErrors(prev => ({ ...prev, person1: { ...prev.person1, image: null } }));
      setPerson1((prev) => ({ ...prev, image: file }));
    } else {
      setErrors(prev => ({ ...prev, person2: { ...prev.person2, image: null } }));
      setPerson2((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form constraints before submission
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, global: "Please fix the validation errors before submitting." }));
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors(prev => ({ ...prev, global: null }));

    const formData = new FormData();
    
    // Only add anniversary if both day and month are provided
    if (anniversary.day && anniversary.month) {
      formData.append('anniversary', formatDate(anniversary.day, anniversary.month));
    }
    
    // Person 1 data - trim only if value exists
    formData.append('name1', person1.name.trim());
    if (person1.club.trim()) formData.append('club1', person1.club.trim());
    if (person1.email.trim()) formData.append('email1', person1.email.trim());
    if (person1.phone.trim()) formData.append('phone1', person1.phone.trim());
    formData.append('userType1', person1.usertype);
    formData.append('role1', person1.role);
    
    // Only add DOB if both day and month are provided
    if (person1.dob.day && person1.dob.month) {
      formData.append('dob1', formatDate(person1.dob.day, person1.dob.month));
    }
    
    if (person1.image) formData.append('image1', person1.image);

    // Person 2 data - trim only if value exists
    // Only add name2 if provided (optional)
    if (person2.name.trim()) {
      formData.append('name2', person2.name.trim());
    }
    if (person2.club.trim()) formData.append('club2', person2.club.trim());
    if (person2.email.trim()) formData.append('email2', person2.email.trim());
    if (person2.phone.trim()) formData.append('phone2', person2.phone.trim());
    formData.append('userType2', person2.usertype);
    formData.append('role2', person2.role);
    
    // Only add DOB if both day and month are provided
    if (person2.dob.day && person2.dob.month) {
      formData.append('dob2', formatDate(person2.dob.day, person2.dob.month));
    }
    
    if (person2.image) formData.append('image2', person2.image);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Reset all form data
        setPerson1(defaultPerson());
        setPerson2(defaultPerson());
        setAnniversary({ day: '', month: '' });
        setErrors({ person1: {}, person2: {}, anniversary: {}, global: null });
        router.refresh();
        
        // Show success message
        setErrors(prev => ({ ...prev, global: "Form submitted successfully!" }));
        setTimeout(() => {
          setErrors(prev => ({ ...prev, global: null }));
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, global: error.message || 'Error submitting form. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-4xl mx-auto bg-white shadow rounded-md text-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Member and Spouse Form</h1>
      
      {/* Global error/success message */}
      {errors.global && (
        <div className={`p-3 rounded ${errors.global.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {errors.global}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonSection
          label="Person 1"
          person={person1}
          onChange={handlePersonChange}
          onDateChange={(e) => handleDateChange(e, 'person1')}
          onImageChange={(e) => handleImageChange(e, 'person1')}
          errors={errors.person1}
          isRequired={true}
        />
        <PersonSection
          label="Person 2 (Optional)"
          person={person2}
          onChange={handlePersonChange}
          onDateChange={(e) => handleDateChange(e, 'person2')}
          onImageChange={(e) => handleImageChange(e, 'person2')}
          errors={errors.person2}
          isRequired={false}
        />
      </div>

      {/* Anniversary section - optional */}
      <div className="pt-4 border-t">
        <h2 className="text-blue-600 font-semibold mb-2">Anniversary Date (Optional)</h2>
        <div className="flex gap-2">
          <div className="w-1/2">
            <input
              type="text"
              className={`border rounded p-1 w-full ${errors.anniversary.date ? 'border-red-500' : ''}`}
              placeholder="Anniversary Day (1-31)"
              name="day"
              value={anniversary.day}
              onChange={(e) => handleDateChange(e, 'anniversary')}
            />
            {errors.anniversary.date && <p className="text-red-500 text-xs mt-1">{errors.anniversary.date}</p>}
          </div>
          <div className="w-1/2">
            <input
              type="text"
              className={`border rounded p-1 w-full ${errors.anniversary.date ? 'border-red-500' : ''}`}
              placeholder="Anniversary Month (1-12)"
              name="month"
              value={anniversary.month}
              onChange={(e) => handleDateChange(e, 'anniversary')}
            />
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-1">Leave empty if not applicable</p>
      </div>

      <div className="pt-4 border-t">
        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto px-4 py-1 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

function PersonSection({ label, person, onChange, onDateChange, onImageChange, errors, isRequired }) {
  const key = label.toLowerCase().replace(' ', '').replace('(optional)', '').trim();

  return (
    <div className="space-y-3">
      <h2 className="text-blue-600 font-semibold">{label}</h2>

      <div>
        <input 
          type="text" 
          name="name" 
          className={`w-full border rounded p-1 ${errors.name ? 'border-red-500' : ''}`} 
          placeholder={`Name ${isRequired ? '*' : '(Optional)'}`} 
          value={person.name} 
          onChange={(e) => onChange(e, key)} 
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        <p className="text-gray-500 text-xs mt-1">
          {isRequired ? 'Required. ' : 'Optional. '}
          Max 100 chars. Letters, spaces, dots, apostrophes, hyphens only.
        </p>
      </div>

      <div>
        <input 
          type="email" 
          name="email" 
          className={`w-full border rounded p-1 ${errors.email ? 'border-red-500' : ''}`} 
          placeholder="Email (Optional)" 
          value={person.email} 
          onChange={(e) => onChange(e, key)} 
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <input 
          type="text" 
          name="phone" 
          className={`w-full border rounded p-1 ${errors.phone ? 'border-red-500' : ''}`} 
          placeholder="Phone (Optional)" 
          value={person.phone} 
          onChange={(e) => onChange(e, key)} 
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        <p className="text-gray-500 text-xs mt-1">10 digits, optional +91 prefix</p>
      </div>

      <div>
        <input 
          type="text" 
          name="club" 
          className="w-full border rounded p-1" 
          placeholder="Club (Optional)" 
          value={person.club} 
          onChange={(e) => onChange(e, key)} 
        />
      </div>

      <div>
        <div className="flex gap-2">
          <input 
            type="text" 
            className={`border rounded p-1 w-1/2 ${errors.dob ? 'border-red-500' : ''}`} 
            placeholder="Day (Optional)" 
            name="day" 
            value={person.dob.day} 
            onChange={onDateChange} 
          />
          <input 
            type="text" 
            className={`border rounded p-1 w-1/2 ${errors.dob ? 'border-red-500' : ''}`} 
            placeholder="Month (Optional)" 
            name="month" 
            value={person.dob.month} 
            onChange={onDateChange} 
          />
        </div>
        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
        <p className="text-gray-500 text-xs mt-1">Provide both day and month, or leave both empty</p>
      </div>

      <div>
        <select 
          name="usertype" 
          className="w-full border rounded p-1" 
          value={person.usertype} 
          onChange={(e) => onChange(e, key)}
        >
          <option value="member">Member</option>
          <option value="spouse">Spouse</option>
        </select>
      </div>

      <div>
        <select 
          name="role" 
          className="w-full border rounded p-1" 
          value={person.role} 
          onChange={(e) => onChange(e, key)}
        >
          <option value="District Team">District Team</option>
          <option value="Influencer President">Influencer President</option>
          <option value="Influencer Secretary">Influencer Secretary</option>
        </select>
      </div>

      <div>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/jpg" 
          className={`w-full ${errors.image ? 'border-red-500' : ''}`} 
          onChange={onImageChange} 
        />
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        {person.image && !errors.image && (
          <p className="text-green-600 text-xs mt-1">
            Image: {person.image.name} ({(person.image.size / 1024).toFixed(1)}KB)
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">Optional. Max 50KB. Only if provided.</p>
      </div>
    </div>
  );
}