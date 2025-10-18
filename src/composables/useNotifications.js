import { ref, onMounted, onUnmounted } from 'vue';

export function useNotifications() {
    const message = ref('');
    const type = ref(''); // 'error', 'warning', 'success', ou outro
    const showSnackbar = ref(false);

    const triggerNotification = ({ message: msg, typeMessage = 'error' }) => {
        message.value = msg;
        type.value = typeMessage;
        showSnackbar.value = true;
    };

    // Função para fechar o snackbar
    const clearNotification = () => {
        showSnackbar.value = false;
        message.value = '';
        type.value = '';
    };

    const handler = (event) => {
        // console.log('Evento recebido:', event.detail); // Debug
        triggerNotification({
            message: event.detail.message,
            typeMessage: event.detail.type || 'error',
        });
    };

    onMounted(() => {
        window.addEventListener('notification', handler);
    });

    onUnmounted(() => {
        window.removeEventListener('notification', handler);
    });

    return { message, type, showSnackbar, triggerNotification, clearNotification };
}