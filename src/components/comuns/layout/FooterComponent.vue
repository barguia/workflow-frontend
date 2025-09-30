<template>
  <v-footer color="grey-darken-4" dark class="py-6">
    <v-container>
      <v-row class="justify-center text-center">
        <v-col cols="12" sm="6" md="4" class="mb-2">
          <h3 class="footer-title">Conecte-se conosco</h3>
          <div class="social-links">

            <v-btn
                v-for="link in getSocialLinks()"
                :key="link.name"
                :href="link.url"
                target="_blank"
                icon
            >
              <v-icon :color="link.color">{{ link.icon }}</v-icon>
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" class="text-center">
          <p class="mb-0">&copy; {{ new Date().getFullYear() }} Auri Web. Todos os direitos reservados.</p>
          <div class="flex justify-center space-x-4 mt-4">
            <RouterLink
                :to="item.path"
                v-for="item in menus"
                :key="item.name"
                class="nav-link ma-2 hover:text-blue-300"
            >
              {{ item.name }}
            </RouterLink>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>

export default {
  props: ['menus'],
  data() {
    return {
      socialLinks: [
        // { name: "LinkedIn", icon: "mdi-linkedin", url: process.env.VUE_APP_URL_LINKEDIN ?? '', color: '#0077B5'},
        // { name: "GitHub", icon: "mdi-github", url: process.env.VUE_APP_URL_GITHUB ?? '', color: '#181717' },
        // { name: "Twitter", icon: "mdi-twitter", url: process.env.VUE_APP_URL_TWITTER_X ?? '', color: '#1DA1F2' },
        { name: "Facebook", icon: "mdi-facebook", url: 'https://www.facebook.com/profile.php?id=61581230668068', color: '#1877F2' },
        { name: "Instagram", icon: "mdi-instagram", url: 'https://www.instagram.com/auriweb.brasil/', color: '#E1306C' },
        { name: "WhatsApp", icon: "mdi-whatsapp", url: 'https://wa.me/5519995323907', color: 'success' },
      ],
    };
  },
  methods: {
    getSocialLinks() {
      return this.socialLinks.filter(item => item.url !== '');
    }
  }
};
</script>

<style scoped>
.footer-title {
  font-weight: bold;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 10px;
  justify-content: center;
}


p {
  font-size: 0.875rem;
}
</style>
