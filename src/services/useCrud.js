import Crud from "@/services/crud";
import { ref } from 'vue';

function handleCrudError(error, errors, snackbarMessage, showSnackbar) {
    errors.value = error.errors;
    snackbarMessage.value = error.message;
    showSnackbar.value = true;
    throw error;
}

export function useCrud(route) {
    const errors = ref({});
    const snackbarMessage = ref('');
    const showSnackbar = ref(false);
    const crudService = new Crud(route);

    const index = async (payload) => {
        try {
            return await crudService.index(payload);
        } catch (error) {
            handleCrudError(error, errors, snackbarMessage, showSnackbar);
        }
    };

    const create = async (payload) => {
        try {
            return await crudService.create(payload);
        } catch (error) {
            handleCrudError(error, errors, snackbarMessage, showSnackbar);
        }
    };

    const update = async (payload) => {
        try {
            return await crudService.update(payload);
        }  catch (error) {
            handleCrudError(error, errors, snackbarMessage, showSnackbar);
        }
    };

    const deleteItem = async (payload) => {
        try {
            return await crudService.delete(payload);
        }  catch (error) {
            handleCrudError(error, errors, snackbarMessage, showSnackbar);
        }
    };

    const search = async (body, queryParams) => {
        try {
            return await crudService.search(body, queryParams);
        } catch (error) {
            handleCrudError(error, errors, snackbarMessage, showSnackbar);
        }
    };

    const fetchColumns = async () => {
        try {
            return await crudService.columns();
        } catch {
            return [];
        }
    };

    return { index, create, update, deleteItem, search, fetchColumns, errors, snackbarMessage, showSnackbar };
}
