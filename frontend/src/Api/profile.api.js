import api from "./axios";

// Upload profile image (Corresponds to: PUT /profile-image)
export const uploadProfileImage = (formData) =>
    api.put("/profile/profile-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

// Update education details (Corresponds to: PUT /education)
export const updateEducationDetails = (data) =>
    api.put("/profile/education", data);

// Upload resume (Corresponds to: POST /uploadresume)
export const uploadResume = (formData) =>
    api.post("/profile/uploadresume", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

// Update personal profile (Corresponds to: PUT /update)
export const updateProfile = (data) =>
    api.put("/profile/update", data);