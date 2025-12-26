window.plugNmeetConfig = {
  // URL của NestJS Gateway (đừng dùng port 3000 vì code server đang để 8080)
  serverUrl: 'http://localhost:8080',

  // Các tùy chọn tối ưu hóa LiveKit
  enableDynacast: true,
  enableSimulcast: true,
  videoCodec: 'vp8',
  defaultWebcamResolution: 'h720',
  defaultScreenShareResolution: 'h1080fps15',
  defaultAudioPreset: 'music',
  stopMicTrackOnMute: true,
  focusActiveSpeakerWebcam: true,

  // Tùy chọn giao diện (nếu muốn chỉnh)
  /*designCustomization: {
    primary_color: '#004D90',
    secondary_color: '#24AEF7',
    background_color: '#0b7db4',
  },*/
};

// --- Phần giữ tương thích ngược (BẮT BUỘC GIỮ LẠI) ---
window.PLUG_N_MEET_SERVER_URL = window.plugNmeetConfig.serverUrl;
window.STATIC_ASSETS_PATH = window.plugNmeetConfig.staticAssetsPath;
window.CUSTOM_LOGO = window.plugNmeetConfig.customLogo;
window.ENABLE_DYNACAST = window.plugNmeetConfig.enableDynacast;
window.ENABLE_SIMULCAST = window.plugNmeetConfig.enableSimulcast;
window.VIDEO_CODEC = window.plugNmeetConfig.videoCodec;
window.DEFAULT_WEBCAM_RESOLUTION = window.plugNmeetConfig.defaultWebcamResolution;
window.DEFAULT_SCREEN_SHARE_RESOLUTION = window.plugNmeetConfig.defaultScreenShareResolution;
window.DEFAULT_AUDIO_PRESET = window.plugNmeetConfig.defaultAudioPreset;
window.STOP_MIC_TRACK_ON_MUTE = window.plugNmeetConfig.stopMicTrackOnMute;
window.FOCUS_ACTIVE_SPEAKER_WEBCAM = window.plugNmeetConfig.focusActiveSpeakerWebcam;
window.DESIGN_CUSTOMIZATION = window.plugNmeetConfig.designCustomization;
window.WHITEBOARD_PRELOADED_LIBRARY_ITEMS = window.plugNmeetConfig.whiteboardPreloadedLibraryItems;
window.PNM_VIRTUAL_BG_IMGS = window.plugNmeetConfig.virtualBackgroundImages;
