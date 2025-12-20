// PlugNmeet Configuration
// Cloned from plugNmeet-client/src/assets/config_sample.js

export type VideoCodec = 'vp8' | 'h264' | 'vp9' | 'av1';
export type WebcamResolution = 'h90' | 'h180' | 'h216' | 'h360' | 'h540' | 'h720' | 'h1080' | 'h1440' | 'h2160';
export type ScreenShareResolution = 'h360fps3' | 'h720fps5' | 'h720fps15' | 'h1080fps15' | 'h1080fps30';
export type AudioPreset = 'telephone' | 'speech' | 'music' | 'musicStereo' | 'musicHighQuality' | 'musicHighQualityStereo';

export interface CustomLogo {
    main_logo_light?: string;
    main_logo_dark?: string;
}

export interface DesignCustomization {
    primary_color?: string;
    secondary_color?: string;
    background_color?: string;
    background_image?: string;
    header_bg_color?: string;
    footer_bg_color?: string;
    left_side_bg_color?: string;
    right_side_bg_color?: string;
    custom_css_url?: string;
    custom_logo?: string;
}

export interface PlugNmeetConfig {
    // The URL of your plugNmeet server
    serverUrl: string;

    // Static assets path for external plugin development
    staticAssetsPath?: string;

    // Custom logos (use direct HTTPS links for best results)
    customLogo?: CustomLogo;

    // Dynacast: dynamically pauses video layers not consumed by subscribers
    // Significantly reduces publishing CPU and bandwidth usage
    enableDynacast?: boolean;

    // Simulcast: LiveKit publishes up to 3 versions at various resolutions
    enableSimulcast?: boolean;

    // Video codec: 'vp8' | 'h264' | 'vp9' | 'av1'
    videoCodec?: VideoCodec;

    // Default webcam resolution
    defaultWebcamResolution?: WebcamResolution;

    // Default screen share resolution
    defaultScreenShareResolution?: ScreenShareResolution;

    // Default audio preset
    defaultAudioPreset?: AudioPreset;

    // Stop MediaStreamTrack when muted (disables mic indicator on some platforms)
    // Note: BT devices will transition between profiles (HFP to A2DP)
    stopMicTrackOnMute?: boolean;

    // Relocate webcam view based on active speaker
    focusActiveSpeakerWebcam?: boolean;

    // Design customization
    designCustomization?: DesignCustomization;

    // Whiteboard preloaded library items (full URLs)
    // Get items from: https://libraries.excalidraw.com
    whiteboardPreloadedLibraryItems?: string[];

    // Default virtual background images (use direct HTTPS links)
    virtualBackgroundImages?: string[];

    // Database cleanup age in milliseconds (default: 6 hours)
    dbMaxAgeMs?: number;
}

// Default configuration
export const plugNmeetConfig: PlugNmeetConfig = {
    serverUrl: process.env.NEXT_PUBLIC_PLUGNMEET_SERVER_URL || 'http://localhost:8080',

    // Video/Audio settings
    enableDynacast: true,
    enableSimulcast: true,
    videoCodec: 'vp8',
    defaultWebcamResolution: 'h720',
    defaultScreenShareResolution: 'h1080fps15',
    defaultAudioPreset: 'music',
    stopMicTrackOnMute: true,
    focusActiveSpeakerWebcam: true,

    // Database
    dbMaxAgeMs: 6 * 60 * 60 * 1000, // 6 hours

    // Optional: Uncomment and customize as needed
    // staticAssetsPath: '',
    // customLogo: {
    //   main_logo_light: 'https://mydomain.com/logo_light.png',
    //   main_logo_dark: 'https://mydomain.com/logo_dark.png',
    // },
    // designCustomization: {
    //   primary_color: '#004D90',
    //   secondary_color: '#24AEF7',
    //   background_color: '#0b7db4',
    //   header_bg_color: '#45b3ec',
    //   footer_bg_color: '#45b3ec',
    // },
    // whiteboardPreloadedLibraryItems: [
    //   'https://libraries.excalidraw.com/libraries/BjoernKW/UML-ER-library.excalidrawlib',
    // ],
    // virtualBackgroundImages: [
    //   'https://www.example.com/vb_bg/image1.png',
    // ],
};

// Export for window object (compatibility with plugNmeet components)
if (typeof window !== 'undefined') {
    (window as any).plugNmeetConfig = plugNmeetConfig;

    // Backward compatibility variables
    (window as any).PLUG_N_MEET_SERVER_URL = plugNmeetConfig.serverUrl;
    (window as any).STATIC_ASSETS_PATH = plugNmeetConfig.staticAssetsPath;
    (window as any).CUSTOM_LOGO = plugNmeetConfig.customLogo;
    (window as any).ENABLE_DYNACAST = plugNmeetConfig.enableDynacast;
    (window as any).ENABLE_SIMULCAST = plugNmeetConfig.enableSimulcast;
    (window as any).VIDEO_CODEC = plugNmeetConfig.videoCodec;
    (window as any).DEFAULT_WEBCAM_RESOLUTION = plugNmeetConfig.defaultWebcamResolution;
    (window as any).DEFAULT_SCREEN_SHARE_RESOLUTION = plugNmeetConfig.defaultScreenShareResolution;
    (window as any).DEFAULT_AUDIO_PRESET = plugNmeetConfig.defaultAudioPreset;
    (window as any).STOP_MIC_TRACK_ON_MUTE = plugNmeetConfig.stopMicTrackOnMute;
    (window as any).FOCUS_ACTIVE_SPEAKER_WEBCAM = plugNmeetConfig.focusActiveSpeakerWebcam;
    (window as any).DESIGN_CUSTOMIZATION = plugNmeetConfig.designCustomization;
    (window as any).WHITEBOARD_PRELOADED_LIBRARY_ITEMS = plugNmeetConfig.whiteboardPreloadedLibraryItems;
    (window as any).PNM_VIRTUAL_BG_IMGS = plugNmeetConfig.virtualBackgroundImages;
}
