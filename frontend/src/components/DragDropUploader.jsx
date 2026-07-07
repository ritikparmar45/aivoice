import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../context/AppContext';
import { UploadCloud, AudioLines, AlertCircle, FileAudio, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DragDropUploader() {
  const {
    hasConsent,
    setHasConsent,
    isAnalyzing,
    uploadProgress,
    uploadAndAnalyzeFile,
    resetState,
  } = useApp();

  const [isDragActive, setIsDragActive] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize React Hook Form
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      consent: hasConsent,
    }
  });

  const watchConsent = watch('consent');

  // Synchronize React Hook Form state with global context state
  useEffect(() => {
    setHasConsent(watchConsent);
    if (!watchConsent) {
      handleRemove();
    }
  }, [watchConsent, setHasConsent]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Validate mime-type and format
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    const fileType = file.type || '';
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    const isValidType = validTypes.includes(fileType) || ['mp3', 'wav', 'm4a', 'webm', 'ogg'].includes(fileExtension);
    
    if (!isValidType) {
      toast.error('Unsupported audio file type. Please upload MP3, WAV, M4A, WEBM, or OGG.');
      return;
    }

    // Validate size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setIsValidating(true);
    
    // Check audio duration using HTML5 Audio metadata loader
    try {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        const audioLength = audio.duration;
        URL.revokeObjectURL(audioUrl); // Clean up memory

        if (isNaN(audioLength)) {
          toast.error('Could not verify audio length. Please try a different audio format.');
          setIsValidating(false);
          return;
        }

        if (audioLength < 30 || audioLength > 45) {
          toast.error(`Audio duration must be between 30 and 45 seconds. Loaded: ${Math.round(audioLength)}s`);
          setIsValidating(false);
          return;
        }

        setDuration(audioLength);
        setLocalFile(file);
        setIsValidating(false);
        toast.success(`Audio verified successfully (${Math.round(audioLength)}s). Ready to analyze!`);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl);
        toast.error('Error loading audio file. It may be corrupted or in an unsupported format.');
        setIsValidating(false);
      });
    } catch (err) {
      console.error(err);
      toast.error('Error reading file metadata.');
      setIsValidating(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (!watchConsent) {
      toast.error('Please accept the data privacy consent first.');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (!watchConsent) {
      toast.error('Please accept the data privacy consent first.');
      return;
    }
    fileInputRef.current.click();
  };

  const handleRemove = () => {
    setLocalFile(null);
    setDuration(null);
    resetState();
  };

  const onSubmit = () => {
    if (!localFile) {
      toast.error('Please select or drop an audio file first.');
      return;
    }
    uploadAndAnalyzeFile(localFile);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto">
      {/* Consent Section */}
      <div className="glass-panel rounded-2xl p-6 mb-6 border-white/5 shadow-xl">
        <h3 className="font-display font-bold text-lg text-white mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-brand-secondary" />
          Data Privacy & Consent
        </h3>
        <p className="text-sm text-white/70 leading-relaxed mb-4">
          To comply with the Digital Personal Data Protection (DPDP) standards, we process your audio stream purely in temporary memory. 
          Your audio file is transcribed and scored in real time, and is immediately destroyed on our servers afterwards. We do not persist files or audio metadata.
        </p>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isAnalyzing}
            {...register('consent', { required: true })}
            className="mt-1 h-4 w-4 rounded-sm border-white/20 bg-dark-surface text-brand-primary focus:ring-brand-primary cursor-pointer"
          />
          <span className="text-xs sm:text-sm text-white/90 font-medium">
            I explicitly consent to having my audio temporarily uploaded and analyzed for pronunciation.
          </span>
        </label>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 min-h-[260px] glass-panel ${
          !watchConsent
            ? 'opacity-40 cursor-not-allowed border-white/5'
            : isDragActive
            ? 'border-brand-primary bg-brand-primary/5 scale-[1.01]'
            : 'border-white/10 hover:border-brand-secondary/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav,.m4a,.webm,.ogg"
          onChange={handleChange}
          disabled={!watchConsent || isAnalyzing || isValidating}
        />

        {isValidating ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            <p className="text-sm font-semibold text-white/80">Validating audio duration...</p>
          </div>
        ) : !localFile ? (
          <div className="flex flex-col items-center">
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition-transform ${watchConsent && 'animate-float'}`}>
              <UploadCloud className="h-7 w-7 text-brand-secondary" />
            </div>
            <h4 className="font-display font-semibold text-white mb-1">
              Drag & drop your audio file here
            </h4>
            <p className="text-xs text-white/50 mb-4">
              Acceptable file formats: MP3, WAV, M4A, WEBM (30 to 45 seconds, max 10MB)
            </p>
            <button
              type="button"
              onClick={onButtonClick}
              disabled={!watchConsent}
              className={`rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition-all ${
                watchConsent
                  ? 'bg-linear-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 active:scale-95 cursor-pointer'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
              <FileAudio className="h-7 w-7 text-brand-secondary" />
            </div>
            <h4 className="font-display font-semibold text-white text-base max-w-md truncate mb-1">
              {localFile.name}
            </h4>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs rounded-full bg-white/5 border border-white/10 px-3 py-1 text-white/70">
                {(localFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <span className="text-xs rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-brand-secondary font-semibold">
                {Math.round(duration)} seconds
              </span>
            </div>

            {!isAnalyzing ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition active:scale-95 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                  <span>Remove</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-brand-primary to-brand-secondary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-primary/20 hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  <AudioLines className="h-4 w-4" />
                  <span>Analyze Pronunciation</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/70 font-medium">Uploading & Analyzing...</span>
                  <span className="text-xs text-brand-secondary font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-linear-to-r from-brand-primary to-brand-secondary transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-2 italic">
                  {uploadProgress === 100 
                    ? 'Processing speech files with Whisper & Gemini AI...' 
                    : 'Transmitting audio packets...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
