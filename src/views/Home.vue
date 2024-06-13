<template>
  <v-app>
    <toggleMenu />
    <v-main>
      <v-container>
        <v-row class="my-5" justify="center" align="center">
          <v-col cols="12" md="6">
            <template>
              <v-card :elevation="4" class="pa-3" @click="toVehiculos">
                <v-img src="../assets/Vehiculos.jpg" height="300px" />
                <v-card-title class="justify-center">Vehiculos</v-card-title>
              </v-card>
            </template>
          </v-col>

          <v-col cols="12" md="6" v-if="esAdmin">
            <template>
              <v-card :elevation="4" class="pa-3" @click="toMarcas">
                <v-img src="../assets/Marcas.jpg" height="300px" />
                <v-card-title class="justify-center"
                  >Marcas[ADMIN]</v-card-title
                >
              </v-card>
            </template>
          </v-col>

          <v-col cols="12" md="6" v-if="esAdmin">
            <template>
              <v-card :elevation="4" class="pa-3" @click="toModelos">
                <v-img src="../assets/Modelos.jpg" height="300px" />
                <v-card-title class="justify-center"
                  >Modelos[ADMIN]</v-card-title
                >
              </v-card>
            </template>
          </v-col>

          <v-col cols="12" md="6" v-if="esAdmin">
            <template>
              <v-card :elevation="4" class="pa-3" @click="toCombustibles">
                <v-img src="../assets/Combustible.jpg" height="300px" />
                <v-card-title class="justify-center"
                  >Combustibles[ADMIN]</v-card-title
                >
              </v-card>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <pie />
  </v-app>
</template>

<script>
import pie from "@/components/Footer.vue";
import toggleMenu from "@/components/ToggleMenu.vue";
import router from "@/router";

export default {
  components: {
    toggleMenu,
    pie,
  },
  data() {
    return {
      esAdmin: false,
    };
  },
  created() {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      router.push("/login");
    }

    const params = this.decodeJwt(token.token);
    if (params.ESADMINISTRADOR) {
      this.esAdmin = true;
    }
  },
  methods: {
    toVehiculos() {
      router.push("/Vehiculos");
    },
    toMarcas() {
      router.push("/marcas");
    },
    toModelos() {
      router.push("/modelos");
    },
    toCombustibles() {
      router.push("/combustibles");
    },
    decodeJwt(token) {
      var base64Payload = token.split(".")[1];
      var payload = decodeURIComponent(
        atob(base64Payload)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(payload);
    },
  },
};
</script>

<style scoped>

.v-card-title {
  font-size: 1.5rem;
  text-align: center;
  font-weight: bold;
}

.v-row { margin: 0 auto; }

.v-main { padding: 0 !important; }

</style>
