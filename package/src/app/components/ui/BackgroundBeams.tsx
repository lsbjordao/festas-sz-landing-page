'use client';

export function BackgroundBeams() {
    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            className="fixed inset-0 w-full h-full object-cover z-[-1] pointer-events-none"
        >
            <source src="/videos/bg.mp4" type="video/mp4" />
        </video>

    );
}
