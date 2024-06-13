<template>
  <v-app :style="cssProps">
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import themes from "@/assets/themes"
type typesThemes = 'predeterminado' | 'morado' | 'naranja'



export default Vue.extend({
  name: 'App',
  computed:{
    cssProps(){
      const current = themes[localStorage.getItem("tema") as typesThemes]
      return{
        '--primary-color' : current ? current.primary : themes['predeterminado'].primary,
        '--secondary-color' : current ? current.secondary : themes['predeterminado'].secondary,
        '--accent' : current ? current.accent : themes['predeterminado'].accent,
        '--error' : current ? current.error : themes['predeterminado'].error,
      }
    }
  },
  data: () => ({
    //
  }),
});
</script>
