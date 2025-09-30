import { ref, onMounted, onUnmounted } from 'vue';

export function useValidationErrors() {
    const validationErrors = ref({});

    const handler = (event) => {
        validationErrors.value = event.detail;
    };

    onMounted(() => {
        window.addEventListener('validation-errors', handler);
    });

    onUnmounted(() => {
        window.removeEventListener('validation-errors', handler);
    });

    return { validationErrors };
}
