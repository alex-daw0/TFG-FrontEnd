<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="elevation-12">
              <v-toolbar dark color="#106c4c">
                <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form ref="form" @submit.prevent="login">
                  <h2
                    v-if="loginError"
                    class="text-center errores error pa-3"
                  >
                    Usuario y/o contraseña incorrectos
                  </h2>
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="password"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    label="Contraseña"
                    required
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>

                  <v-btn type="submit" class="mt-4" dark color="#106c4c">
                    Acceder
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import router from "../router/index";

export default {
  data() {
    return {
      showPassword: false,
      email: "",
      password: "",
      loginError: false, 
    };
  },
  created() {
    if (localStorage.getItem("token")) {
      router.push("/");
    }
  },
  methods: {
    login() {
      axios
        .get("https://localhost:7030/Login/login", {
          params: {
            email: this.email,
            pass: this.password,
          },
        })
        .then((response) => {
          localStorage.setItem("token", JSON.stringify(response.data));
          router.push("/");
        })
        .catch((error) => {
          this.loginError = true; 
          console.log("Error al iniciar sesión", error);
          this.email = "";
          this.password = "";
        });
    },
  },
};
</script>
