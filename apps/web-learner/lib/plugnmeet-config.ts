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

// Helpers to parse env vars
const parseBool = (val: string | undefined, defaultVal: boolean): boolean => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return defaultVal;
};

const parseArray = (val: string | undefined): string[] | undefined => {
    if (!val) return undefined;
    return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

const getCustomLogo = (): CustomLogo | undefined => {
    const light = process.env.NEXT_PUBLIC_CUSTOM_LOGO_LIGHT;
    const dark = process.env.NEXT_PUBLIC_CUSTOM_LOGO_DARK;
    if (!light && !dark) return undefined;
    return {
        main_logo_light: light,
        main_logo_dark: dark
    };
};

const getDesignCustomization = (): DesignCustomization | undefined => {
    const opts: DesignCustomization = {};
    let hasVal = false;
    if (process.env.NEXT_PUBLIC_DESIGN_PRIMARY_COLOR) { opts.primary_color = process.env.NEXT_PUBLIC_DESIGN_PRIMARY_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_SECONDARY_COLOR) { opts.secondary_color = process.env.NEXT_PUBLIC_DESIGN_SECONDARY_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_BACKGROUND_COLOR) { opts.background_color = process.env.NEXT_PUBLIC_DESIGN_BACKGROUND_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_HEADER_BG_COLOR) { opts.header_bg_color = process.env.NEXT_PUBLIC_DESIGN_HEADER_BG_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_FOOTER_BG_COLOR) { opts.footer_bg_color = process.env.NEXT_PUBLIC_DESIGN_FOOTER_BG_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_LEFT_SIDE_BG_COLOR) { opts.left_side_bg_color = process.env.NEXT_PUBLIC_DESIGN_LEFT_SIDE_BG_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_RIGHT_SIDE_BG_COLOR) { opts.right_side_bg_color = process.env.NEXT_PUBLIC_DESIGN_RIGHT_SIDE_BG_COLOR; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_CUSTOM_CSS_URL) { opts.custom_css_url = process.env.NEXT_PUBLIC_DESIGN_CUSTOM_CSS_URL; hasVal = true; }
    if (process.env.NEXT_PUBLIC_DESIGN_CUSTOM_LOGO) { opts.custom_logo = process.env.NEXT_PUBLIC_DESIGN_CUSTOM_LOGO; hasVal = true; }

    return hasVal ? opts : undefined;
};


// Default configuration constructed from Env Vars
export const plugNmeetConfig: PlugNmeetConfig = {
    serverUrl: process.env.NEXT_PUBLIC_PLUGNMEET_SERVER_URL || 'http://localhost:8080',
    staticAssetsPath: process.env.NEXT_PUBLIC_STATIC_ASSETS_PATH,
    customLogo: getCustomLogo(),

    // Video/Audio settings
    enableDynacast: parseBool(process.env.NEXT_PUBLIC_ENABLE_DYNACAST, true),
    enableSimulcast: parseBool(process.env.NEXT_PUBLIC_ENABLE_SIMULCAST, true),
    videoCodec: (process.env.NEXT_PUBLIC_VIDEO_CODEC as VideoCodec) || 'vp8',
    defaultWebcamResolution: (process.env.NEXT_PUBLIC_DEFAULT_WEBCAM_RESOLUTION as WebcamResolution) || 'h720',
    defaultScreenShareResolution: (process.env.NEXT_PUBLIC_DEFAULT_SCREEN_SHARE_RESOLUTION as ScreenShareResolution) || 'h1080fps15',
    defaultAudioPreset: (process.env.NEXT_PUBLIC_DEFAULT_AUDIO_PRESET as AudioPreset) || 'music',

    stopMicTrackOnMute: parseBool(process.env.NEXT_PUBLIC_STOP_MIC_TRACK_ON_MUTE, true),
    focusActiveSpeakerWebcam: parseBool(process.env.NEXT_PUBLIC_FOCUS_ACTIVE_SPEAKER_WEBCAM, true),

    designCustomization: getDesignCustomization(),

    whiteboardPreloadedLibraryItems: parseArray(process.env.NEXT_PUBLIC_WHITEBOARD_LIBRARY_ITEMS),
    virtualBackgroundImages: parseArray(process.env.NEXT_PUBLIC_VIRTUAL_BACKGROUND_IMAGES),

    // Database
    dbMaxAgeMs: Number(process.env.NEXT_PUBLIC_DB_MAX_AGE_MS) || 6 * 60 * 60 * 1000, // 6 hours
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
