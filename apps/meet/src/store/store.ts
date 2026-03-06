import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import activeSpeakersSlice from '@/store/slices/activeSpeakersSlice';
import participantSlice from '@/store/slices/participantSlice';
import sessionSlice from '@/store/slices/sessionSlice';
import bottomIconsSlice from '@/store/slices/bottomIconsActivitySlice';
import chatMessagesSlice from '@/store/slices/chatMessagesSlice';
import roomSettingsSlice from '@/store/slices/roomSettingsSlice';
import whiteboardSlice from '@/store/slices/whiteboard';
import externalMediaPlayerSlice from '@/store/slices/externalMediaPlayer';
import { pollsApi } from '@/store/services/pollsApi';
import breakoutRoomSlice from '@/store/slices/breakoutRoomSlice';
import { breakoutRoomApi } from '@/store/services/breakoutRoomApi';
import speechServicesSlice from '@/store/slices/speechServicesSlice';
import insightsAiTextChatSlice from '@/store/slices/insightsAiTextChatSlice';

declare const IS_PRODUCTION: boolean;

export const store = configureStore({
  reducer: {
    participants: participantSlice,
    activeSpeakers: activeSpeakersSlice,
    session: sessionSlice,
    bottomIconsActivity: bottomIconsSlice,
    chatMessages: chatMessagesSlice,
    roomSettings: roomSettingsSlice,
    whiteboard: whiteboardSlice,
    externalMediaPlayer: externalMediaPlayerSlice,
    breakoutRoom: breakoutRoomSlice,
    [pollsApi.reducerPath]: pollsApi.reducer,
    [breakoutRoomApi.reducerPath]: breakoutRoomApi.reducer,
    speechServices: speechServicesSlice,
    insightsAiTextChat: insightsAiTextChatSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      pollsApi.middleware,
      breakoutRoomApi.middleware,
    ),
  devTools: !IS_PRODUCTION,
});

setupListeners(store.dispatch);
