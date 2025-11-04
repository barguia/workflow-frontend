import api from "@/services/api";

class Crud {
    constructor(route, axiosApi = api) {
        this.api = axiosApi;
        this.route = route;
    }

    async index(payload = {}) {
        let parametros = {};
        if (payload !== {}) {
            parametros = {payload};
        }
        const response = await this.api.get(`${this.route}`, parametros);
        return response.data.data;
    }

    async create(payload) {
        const response = await this.api.post(this.route, payload);
        return response.data;
    }

    async update(payload) {
        const response = await this.api.put(`${this.route}/${payload.id}`, payload);
        return response.data;
    }

    async delete(payload) {
        const response = await this.api.delete(`${this.route}/${payload.id}`);
        return response.data;
    }
}

export default Crud;
