import { ref } from 'vue';

// Estado css compartilhado
const loadingCount = ref(0);

export function useLoading() {
    const startLoading = () => {
        loadingCount.value = 1;
    };

    const stopLoading = () => {
        loadingCount.value = 0;
    };

    const isLoading = () => loadingCount.value > 0;

    return { isLoading, startLoading, stopLoading };
}