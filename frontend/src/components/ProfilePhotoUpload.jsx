import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { useSelector } from 'react-redux';

function ProfilePhotoUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [uploadComplete, setUploadComplete] = useState(false);
    const { user } = useSelector((state) => state.auth);
    
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError,
        clearErrors
    } = useForm();

    const selectedFile = watch('photoFile')?.[0];

    // Upload photo to Cloudinary
    const onSubmit = async (data) => {
        const file = data.photoFile[0];
     
        setUploading(true);
        setUploadProgress(0);
        setUploadComplete(false);
        clearErrors();

        try {
            // Step 1: Get upload signature from backend
            const signatureResponse = await axiosClient.get('/video/image/upload-signature');
            const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // Step 3: Upload directly to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            const cloudinaryResult = uploadResponse.data;

            // Step 4: Save photo metadata to backend
            const metadataResponse = await axiosClient.post('/video/image/save', {
                userId: user._id,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
            });

            setUploadedPhoto(metadataResponse.data.photo);
            setUploadComplete(true);
            reset();
            
        } catch (err) {
            console.error('Upload error:', err);
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Upload failed. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
    };


    return (
        <div className="max-w-md mx-auto p-6 mt-15">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Upload Photo</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* File Input */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Choose photo file</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register('photoFile', {
                                    required: 'Please select a photo file',
                                    validate: {
                                        isImage: (files) => {
                                            if (!files || !files[0]) return 'Please select a photo file';
                                            const file = files[0];
                                            return file.type.startsWith('image/') || 'Please select a valid image file';
                                        },
                                        fileSize: (files) => {
                                            if (!files || !files[0]) return true;
                                            const file = files[0];
                                            const maxSize = 5 * 1024 * 1024; // 5MB
                                            return file.size <= maxSize || 'File size must be less than 5MB';
                                        }
                                    }
                                })}
                                className={`file-input file-input-bordered w-full ${errors.photoFile ? 'file-input-error' : ''}`}
                                disabled={uploading}
                            />
                            {errors.photoFile && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.photoFile.message}</span>
                                </label>
                            )}
                        </div>

                        {/* Selected File Info */}
                        {selectedFile && (
                            <div className="alert alert-info">
                                <div>
                                    <h3 className="font-bold">Selected File:</h3>
                                    <p className="text-sm">{selectedFile.name}</p>
                                    <p className="text-sm">Size: {formatFileSize(selectedFile.size)}</p>
                                    <p className="text-sm">Type: {selectedFile.type}</p>
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <progress 
                                    className="progress progress-primary w-full" 
                                    value={uploadProgress} 
                                    max="100"
                                ></progress>
                            </div>
                        )}

                        {/* Error Message */}
                        {errors.root && (
                            <div className="alert alert-error">
                                <span>{errors.root.message}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {uploadComplete && (
                            <div className="alert alert-success">
                                <div>
                                    <h3 className="font-bold">Done!</h3>
                                    {uploadedPhoto && (
                                        <>
                                            {/* <p className="text-sm">Dimensions: {formatDimensions(uploadedPhoto.width, uploadedPhoto.height)}</p>
                                            <p className="text-sm">Uploaded: {new Date(uploadedPhoto.uploadedAt).toLocaleString()}</p> */}
                                            <div className="mt-2">
                                                <img 
                                                    src={uploadedPhoto.secureUrl} 
                                                    alt="Uploaded preview" 
                                                    className="max-w-full h-auto rounded-md"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="card-actions justify-end">
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                            >
                                {uploading ? 'Uploading...' : 'Upload Photo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfilePhotoUpload;