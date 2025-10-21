
import React from 'react';

export const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

export const DownloadProjectIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z M16,15h-3v4h-2v-4H8l4-4L16,15z"/>
    </svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
);


export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6zM17 3a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V3zM17 17a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1z" />
    </svg>
);

export const DesktopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const TabletIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const MobileIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const UndoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

export const RedoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);

// New Window Control Icons
export const MinimizeIcon = ({ className }: { className?: string }) => (
    <svg className={className} x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1"></rect></svg>
);
export const WindowMaximizeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z"></path></svg>
);
export const CloseIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1"></polygon></svg>
);

// Newly Added/Fixed Icons
export const FileIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const MdIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.5 3h-17A1.5 1.5 0 0 0 2 4.5v15A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 20.5 3zM18 17h-1.5V9.33l-2.25 2.22l-1.5-1.05L16.5 6H18v11zm-6.75 0h-1.5v-4.5H7.5V17H6V7h4.5v1.5h-3V11h3v1.5h-3V17h1.25z"/>
    </svg>
);

export const PreviewIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);


// Colored File Icons
export const HtmlIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3L5.77778 20.0899L12 22L18.2222 20.0899L20 3H4Z" fill="#E44D26"></path><path d="M12 5V19.9L17.2222 18.2889L18.5 5H12Z" fill="#F16529"></path><path d="M12 9H7.5L7.25 6.5H12V9ZM12 15L11.95 15.01L9.25 14.25L9 12H12V15Z" fill="white"></path><path d="M12 12H16.5L16.25 9.5H12V12ZM12 17.2V15H15.65L15.35 18.2L12 19V17.2Z" fill="#EBEBEB"></path></svg>
);
export const CssIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3L5.77778 20.0899L12 22L18.2222 20.0899L20 3H4Z" fill="#0277BD"></path><path d="M12 5V19.9L17.2222 18.2889L18.5 5H12Z" fill="#039BE5"></path><path d="M12 9H9.5L9.25 6.5H12V9ZM12 15L11.95 15.01L9.25 14.25L9 12H12V15Z" fill="white"></path><path d="M12 12H15.5L15.25 9.5H12V12ZM12 17.2V15H14.65L14.35 18.2L12 19V17.2Z" fill="#EBEBEB"></path></svg>
);
export const JsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 0H0V24H24V0Z" fill="#F7DF1E"></path><path d="M16.425 13.35C16.05 14.175 15.3 14.85 14.25 14.85C13.275 14.85 12.6 14.25 12.6 13.5C12.6 12.75 13.125 12.3 14.025 11.925L14.475 11.775C15.15 11.55 15.375 11.4 15.375 10.95C15.375 10.5 15.075 10.2 14.475 10.2C13.8 10.2 13.425 10.575 13.2 11.1L11.25 11.1C11.4 9.675 12.675 8.7 14.475 8.7C16.125 8.7 17.325 9.6 17.325 10.875C17.325 12.075 16.575 12.75 15.6 13.125L15.15 13.275C14.625 13.5 14.4 13.65 14.4 14.025C14.4 14.4 14.7 14.7 15.225 14.7C15.9 14.7 16.275 14.25 16.5 13.8L16.425 13.35ZM8.4 14.625C7.575 14.625 7.05 14.1 7.05 13.275V8.85H9V12.975C9 13.5 9.225 13.725 9.675 13.725C10.125 13.725 10.5 13.5 10.5 12.975V8.85H12.45V14.475H10.65L10.575 13.575C10.2 14.25 9.45 14.625 8.4 14.625Z" fill="black"></path></svg>
);
export const TsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="3" fill="#3178C6"></rect><path d="M10.125 16.5H8.625V8.625H12.75V10.125H10.125V12.375H12.375V13.875H10.125V16.5ZM16.6343 14.0766C17.0653 13.7153 17.3348 13.3153 17.4428 12.8766H15.8273V11.625H18.9368V12.4688C18.7343 13.7153 18.0683 14.6516 16.9393 15.2766L18.0293 16.5H16.3523L15.3923 15.3858V16.5H13.8923V8.625H17.0273C17.7713 8.625 18.3113 8.78663 18.6473 9.10988C18.9833 9.43313 19.1513 9.94163 19.1513 10.6358C19.1513 11.2358 19.0185 11.7253 18.7523 12.1043C18.486 12.4748 18.1073 12.7448 17.6153 12.9143L18.4403 14.3903L16.6343 14.0766ZM17.6573 11.439C17.9153 11.2805 18.0443 11.0015 18.0443 10.602C18.0443 10.2315 17.9063 9.9615 17.6303 9.792C17.3628 9.6225 16.9748 9.53775 16.4663 9.53775H15.3923V11.439H17.6573Z" fill="white"></path></svg>
);
export const JsonIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#FBC02D"></path><path d="M13.25 15.75C12.18 15.75 11.16 15.3 10.2 14.41C9.23 13.52 8.75 12.35 8.75 11.1C8.75 9.85 9.23 8.68 10.2 7.79C11.16 6.9 12.18 6.45 13.25 6.45C14.32 6.45 15.34 6.9 16.3 7.79C17.27 8.68 17.75 9.85 17.75 11.1C17.75 12.35 17.27 13.52 16.3 14.41C15.34 15.3 14.32 15.75 13.25 15.75ZM6.25 11.1C6.25 12.35 6.73 13.52 7.7 14.41C6.91 15.34 6.45 16.32 6.45 17.3C6.45 18.38 6.91 19.36 7.7 20.29C8.49 19.53 9.03 18.57 9.24 17.5C9.75 17.97 10.36 18.32 11.04 18.53C10.74 19.38 10.24 20.12 9.59 20.7C10.29 21.32 11.12 21.75 12 21.75C12.88 21.75 13.71 21.32 14.41 20.7C15.06 20.12 15.56 19.38 15.86 18.53C16.54 18.32 17.15 17.97 17.66 17.5C17.87 18.57 18.41 19.53 19.2 20.29C19.99 19.36 20.45 18.38 20.45 17.3C20.45 16.32 19.99 15.34 19.2 14.41C20.17 13.52 20.65 12.35 20.65 11.1C20.65 9.85 20.17 8.68 19.2 7.79C19.99 6.86 20.45 5.88 20.45 4.9C20.45 3.82 19.99 2.84 19.2 1.91C18.41 2.67 17.87 3.63 17.66 4.7C17.15 4.23 16.54 3.88 15.86 3.67C15.56 2.82 15.06 2.08 14.41 1.5C13.71 0.88 12.88 0.45 12 0.45C11.12 0.45 10.29 0.88 9.59 1.5C8.94 2.08 8.44 2.82 8.14 3.67C7.46 3.88 6.85 4.23 6.34 4.7C6.13 3.63 5.59 2.67 4.8 1.91C