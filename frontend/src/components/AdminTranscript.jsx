import { useParams } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../utils/axiosClient';

function AdminTranscript() {
    const { problemId } = useParams();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedTranscript, setUploadedTranscript] = useState(null);
    const [transcriptText, setTranscriptText] = useState('');
    
    const {
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors
    } = useForm();

    // Send full transcript to backend
    const onSubmit = async () => {
        if (!transcriptText.trim()) {
            setError('transcript', {
                type: 'manual',
                message: 'Please enter transcript text'
            });
            return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        clearErrors();

        try {
            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + 10;
                    if (newProgress >= 90) clearInterval(interval);
                    return newProgress;
                });
            }, 200);

            // Send complete transcript to backend
            const response = await axiosClient.post("video/transcript", {
                problemId: problemId,
                fullTranscript: transcriptText,
                metadata: {
                    totalLength: transcriptText.length,
                    totalWords: transcriptText.split(/\s+/).filter(Boolean).length
                }
            });
            console.log(response.data)
            clearInterval(interval);
            setUploadProgress(100);
            setUploadedTranscript(response.data);
            
        } catch (err) {
            console.error('Upload error:', err);
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Failed to save transcript'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Upload Transcript</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Enter transcript text</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                placeholder="Paste transcript here..."
                                rows={10}
                                value={transcriptText}
                                onChange={(e) => setTranscriptText(e.target.value)}
                                disabled={uploading}
                            />
                        </div>

                        {/* Upload progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading... {uploadProgress}%</span>
                                </div>
                                <progress 
                                    className="progress progress-primary w-full" 
                                    value={uploadProgress} 
                                    max="100"
                                ></progress>
                            </div>
                        )}

                        {/* Error message */}
                        {errors.root && (
                            <div className="alert alert-error">
                                <span>{errors.root.message}</span>
                            </div>
                        )}

                        {/* Submit button */}
                        <div className="card-actions justify-end">
                            <button
                                type="submit"
                                disabled={uploading || !transcriptText.trim()}
                                className={`btn btn-primary ${uploading ? 'loading' : ''}`}
                            >
                                {uploading ? 'Uploading...' : 'Save Transcript'}
                            </button>
                        </div>
                    </form>

                    {/* Success message */}
                    {uploadedTranscript && (
                        <div className="alert alert-success mt-4">
                            <div>
                                <h3 className="font-bold">Upload Successful!</h3>
                                <p className="text-sm">Transcript ID: {uploadedTranscript.id}</p>
                                <p className="text-sm">Saved at: {new Date(uploadedTranscript.savedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminTranscript;