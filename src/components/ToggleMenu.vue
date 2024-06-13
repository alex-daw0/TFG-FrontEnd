<template>
  <div class="contenedor">
    <v-toolbar style="background-color: var(--primary-color); color: white">
      <v-app-bar-nav-icon @click="drawer = !drawer">
        <v-icon style="color: white">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="text-h5">{{ empresaNombre }}</v-toolbar-title>
      <v-spacer></v-spacer>
   
      <v-toolbar-title class="text-h7">Logeado como - {{ usuarioNombre }}</v-toolbar-title>

      <v-icon @click="dialog=true" style="color: white">mdi-power</v-icon>
    </v-toolbar>

    <v-navigation-drawer app="app" v-model="drawer" class="sidebar" width="300px" permament="true" style="background-color: var(--primary-color);">
      <div>
        <img src="../assets/logo.jpg"alt="" />
      </div>
      <v-list>

        <v-list-item link="link" to="/">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">Home</v-list-item-title>
        </v-list-item>

        <v-list-item link="link" to="/vehiculos">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-car-settings</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">Vehiculos</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="esAdmin" link="link" to="/marcas">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-cards</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">[ADMIN] Marcas</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="esAdmin" link="link" to="/modelos">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-cards-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">[ADMIN] Modelos</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="esAdmin" link="link" to="/combustibles">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-gas-station</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">[ADMIN] Combustibles</v-list-item-title>
        </v-list-item>

        <v-list-item link="link" to="/perfil">
          <v-list-item-icon>
            <v-icon style="color: white">mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="blanco">Perfil</v-list-item-title>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>
    <v-dialog v-model="dialog" width="500">
        <v-card>
          <form @submit.prevent>

            <h2 class="text-center">Cerrar sesión</h2>
            <v-card-text>
              <p class="centrado">
                Quieres cerrar sesión? Tu empresa activa en el próximo inicio de sesión será la última seleccionada.
              </p>
            <div class="botonesModal">
              <button @click="logout()" class="btn danger">Confirmar</button>
              <button @click="dialog = false" class="btn">Cancelar</button>
            </div>
          </v-card-text>
          </form>
        </v-card>
      </v-dialog>
  </div>

</template>




<script>
import axios from "axios";
import { ref, computed, onMounted } from "vue";

export default {
  data() {
    return {
      drawer: false,
      dialog: false,
      empresaNombre: "",
      usuarioNombre: "",
      esAdmin: false,
    };
  },
  created() {
    const token = JSON.parse(localStorage.getItem("token"));

    if (token) {
      axios
        .get(`https://localhost:7030/Empresa/getEmpresaActiva`, {
          params: { idUsuario: token.userId },
        })
        .then((response) => {
          const empresa = response.data;
          this.empresaNombre = empresa.nombre;
          this.usuarioNombre = token.nombre;
        })
        .catch((error) => {
          console.error("Error al obtener la empresa:", error);
        });
    }

    const params = this.decodeJwt(token.token);
    if (params.ESADMINISTRADOR) {
      this.esAdmin = true;
    }
  },
  methods: {

    logout() {
      localStorage.removeItem('token');
      this.$router.push("login");
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

  }
};
</script>

<style scoped>

.blanco {
  color: white;
}


img {
  width: 100%;
}

.v-list {
  padding: 0;
}






</style>