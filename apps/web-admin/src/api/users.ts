import axios from 'axios';
import type { FindAllUsersResponse } from '@workspace/protocol';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getUsers = async (page = 1, limit = 10, search = ''): Promise<FindAllUsersResponse> => {
    const response = await axios.get<FindAllUsersResponse>(`${API_URL}/admin/users`, {
        params: {
            page,
            limit,
            search,
        },
    });
    return response.data;
};
