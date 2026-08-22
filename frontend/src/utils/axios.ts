// Update your axios.ts file with better error handling
import axios from 'axios';
import { ApiResponse } from '@/types/api';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Track if we're currently refreshing the token to prevent multiple refresh requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// Helper to get user-friendly error message
const getErrorMessage = (error: any): string => {
    const status = error.response?.status;
    const errorData = error.response?.data as ApiResponse | undefined;

    // Custom messages for common HTTP status codes
    switch (status) {
        case 429:
            return 'Too many requests. Please wait a moment and try again.';
        case 500:
            // Deliberately generic: a 500 is an unexpected fault and its
            // message may carry internals not meant for the client.
            return 'Server error. Please try again later.';
        case 502:
            // 502s here are raised on purpose for upstream failures we can name,
            // such as the mail server being unreachable, so the server's own
            // wording is more useful than anything generic.
            return errorData?.message || 'Service temporarily unavailable. Please try again later.';
        case 503:
            return 'Service temporarily unavailable. Please try again later.';
        case 404:
            return errorData?.message || 'Resource not found.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 400:
            return errorData?.message || 'Invalid request. Please check your input.';
        default:
            return errorData?.message || 'An unexpected error occurred. Please try again.';
    }
};

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            config.headers['Authorization'] = `Bearer ${adminToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const path = typeof window !== 'undefined' ? window.location.pathname : '';

        // Normalise the message before anything can return early. This used to
        // happen at the bottom of the handler, past the login-page guard below,
        // so the login screen showed axios's raw "Request failed with status
        // code 401" instead of the server's "Email/Phone or password did not
        // match" -- the one place a readable error matters most.
        error.message = getErrorMessage(error);

        // Special handling for login pages - don't try to refresh token
        if (path === '/login' || path === '/admin-login' || originalRequest.url?.includes('/login')) {
            return Promise.reject(error);
        }

        // The refresh call goes through this same instance, so a 401 from it must
        // never re-enter the refresh branch: it would be queued behind the very
        // refresh it is supposed to complete, and both would hang forever.
        const isRefreshCall = Boolean(originalRequest.url?.includes('/auth/refresh-token'));

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
            if (isRefreshing) {
                // If we're already refreshing, add this request to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry the original request after token refresh
                        return instance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                const response = await instance.get('/auth/refresh-token');

                // A 200 carrying success:false used to fall straight through this
                // block, leaving the handler to resolve with undefined and pinning
                // isRefreshing on. Treat it as the failure it is.
                if (!response.data?.success) {
                    throw new Error('Token refresh was rejected by the server');
                }

                // Process all queued requests
                processQueue(null);

                // Retry the original request with new token
                return instance(originalRequest);
            } catch (refreshError) {
                // Process all queued requests with error
                processQueue(refreshError);

                // If refresh token is also expired or invalid.
                //
                // This used to raise a toast and then immediately assign
                // window.location, which tears the document down before the
                // toast can render: users were bounced to the login screen with
                // no explanation at all. Carry the reason in the URL instead and
                // let the login page render it, so the message survives the
                // navigation.
                if (typeof window !== 'undefined') {
                    if (window.location.pathname.startsWith('/admin')) {
                        localStorage.removeItem('admin');
                        localStorage.removeItem('adminToken');
                        window.location.href = '/admin-login?session=expired';
                    } else {
                        localStorage.removeItem('user');
                        window.location.href = '/login?session=expired';
                    }
                }
                return Promise.reject(refreshError);
            } finally {
                // Must reset on every path. Leaving it set made every later 401
                // queue against a refresh that would never run again.
                isRefreshing = false;
            }
        }

        // The message was normalised at the top of this handler. Callers render
        // it themselves, so this interceptor deliberately does NOT raise a
        // toast: doing both meant one failed request produced two messages, an
        // inline one from the form plus a global toast saying the same thing.
        // The only notification raised from here is the session-expiry case
        // above, which no component is in a position to report.
        return Promise.reject(error);
    }
);

export default instance;