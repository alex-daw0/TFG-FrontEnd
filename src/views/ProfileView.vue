<template>
  <v-app>
    <toggleMenu />
    <v-main>
      <h2 class="text-center">Perfil de Usuario</h2>
      <v-container class="contenedor">
        <v-row >
        <v-col cols="12" md="6" class="d-flex justify-center">
          <v-card width="400" height="200">
            <h3 class="text-center">Datos Personales</h3>
            <v-list>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-office-building </v-icon>
                </v-list-item-icon>
                <v-list-item-title id="empresa"
                  >Empresa Activa -
                </v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-account-tie </v-icon>
                </v-list-item-icon>
                <v-list-item-title id="nombre">Usuario - </v-list-item-title>
              </v-list-item>
            </v-list>
            <div class="d-flex justify-space-around" @click="dialogColores = true">
            <v-btn style="background-color: var(--primary-color); color: white;">Cambiar tema</v-btn>
          </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-center">
          <v-card max-width="400" height="200">
            <h3 class="text-center">Cambio de empresa</h3>
            <v-card-text
              >Si cambias tu empresa activa, la información y los datos
              mostrados variará</v-card-text
            >

            <div class="empresaActiva">
              <div class="d-flex justify-space-around">
                <v-btn
                  style="background-color: var(--primary-color); color: white"
                  class="mt-3"
                  @click="
                    dialog = true;
                    ChangeEmpresa(), CargarEmpresas();
                  "
                >
                  Mis empresas
                </v-btn>

                <v-btn v-if="esAdmin"
                  style="background-color: var(--primary-color); color: white"
                  class="mt-3"
                  @click="
                    dialogGeneral = true;
                    ChangeEmpresa();
                    CargarEmpresasGeneral();
                  "
                  >Todas las empresas</v-btn
                >
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
      </v-container>

      <v-dialog v-model="dialog" width="500">
        <v-card>
          <form @submit.prevent>
            <h2 class="text-center">Cambio de empresa</h2>
            <v-card-text>
              <p class="text-center">
                Al hacer un cambio en tu empresa activa, los datos y la
                información mostrada variarán
              </p>
              <v-select
                :items="empresas"
                item-text="nombre"
                label="Mis Empresas"
                v-model="empresaSelect"
                return-object
              >
                <template v-slot:item="{ props, item }">
                  {{ item.nombre }}
                </template>
              </v-select>
              <div class="botonesModal">
                <button @click="Confirm()" class="btn danger">Confirmar</button>
                <button @click="dialog = false" class="btn">Cancelar</button>
              </div>
            </v-card-text>
          </form>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogGeneral" width="500">
        <v-card>
          <form @submit.prevent>
            <h2 class="text-center">Cambio de empresa</h2>
            <v-card-text>
              <p class="text-center">
                Como administrador, puedes cambiar entre las diferentes empresas
                para añadir, modificar o eliminar registros sin necesidad de
                pertenecer a la empresa que selecciones
              </p>
              <v-select
                :items="empresas"
                item-text="nombre"
                label="Empresas"
                v-model="empresaSelect"
                return-object
              >
                <template v-slot:item="{ props, item }">
                  {{ item.nombre }}
                </template>
              </v-select>
              <div class="botonesModal">
                <button @click="Confirm()" class="btn danger">Confirmar</button>
                <button @click="dialogGeneral = false" class="btn">
                  Cancelar
                </button>
              </div>
            </v-card-text>
          </form>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogColores" width="500">
        <v-card>
          <form @submit.prevent>
            <h2 class="text-center">Cambio de tema</h2>
            <v-card-text>
              <p class="text-center">
                Puedes establecer tu preferencia de colores para que la página te resulte más llamativa
              </p>
              <v-select
                :items="temas"
                item-text="nombre"
                label="Colores"
                v-model="tema"
              >
                <template v-slot:item="{ props, item }" style="color: red;">
                  {{ item.nombre }}
                </template>
              </v-select>
              <div class="botonesModal">
                <button @click="CambiarTema()" class="btn">Confirmar</button>
                <button @click="dialogColores = false" class="btn">
                  Cancelar
                </button>
              </div>
            </v-card-text>
          </form>
        </v-card>
      </v-dialog>
    </v-main>
    <pie />
  </v-app>
</template>

<script>
import { ref } from "vue";
import $router from "/src/router/index.ts";
import axios from "axios";
import pie from "@/components/Footer.vue";
import toggleMenu from "@/components/ToggleMenu.vue";
import LocalStore from "devextreme/data/local_store";


const empresas = ref([]);
const empresaSelect = ref({});

export default {
  components: {
    toggleMenu,
    pie,
  },
  data: () => {
    return {
      dialog: false,
      dialogGeneral: false,
      dialogColores: false,
      empresas: [],
      empresaSelect: {},
      esAdmin: false,
      tema: '',
      temas: [
        {nombre: 'predeterminado', value: 'predeterminado'},
        {nombre: 'morado', value: 'morado'},
        {nombre: 'naranja', value: 'naranja'},

      ]
    };
  },
  created() {
    if (!localStorage.getItem("token")) {
      $router.push("/login");
    }
    const token = JSON.parse(localStorage.getItem("token"));
    const urlEmpresa = "https://localhost:7030/Empresa/getEmpresa";
    const paramsEmpresa = {
      params: {
        id: token.idEmpresa,
      },
    };

    axios
      .get(urlEmpresa, paramsEmpresa)
      .then((response) => {
        document.querySelector("#nombre").textContent += token.nombre;
        document.querySelector("#empresa").textContent += response.data.nombre;
      })
      .catch((error) => {
        console.log(error.response);
      });

    const params = this.decodeJwt(token.token);
    if (params.ESADMINISTRADOR) {
      this.esAdmin = true;
    }

  },
  methods: {
    Confirm() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) {
        $router.push("/login");
      }


      const url = `https://localhost:7030/Empresa/CambiarEmpresaActiva?empAnterior=${token.idEmpresa}&empSiguiente=${this.empresaSelect.id}
      &nombre=${token.nombre}&email=${token.email}&guidUsuario=${token.guiD_Usuario}&userId=${token.userId}&esAdministrador=${this.esAdmin}`;
      axios
        .put(url)
        .then((response) => {
          localStorage.removeItem('token');
          localStorage.setItem("token", JSON.stringify(response.data));
          $router.go(0);
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    CambiarTema() {
      localStorage.setItem('tema', this.tema);
      $router.go(0);
    },

    ChangeEmpresa() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) $router.push("/login");
    },
    CargarEmpresasGeneral() {
      const cadena = "https://localhost:7030/Empresa/getEmpresas";
      axios
        .get(cadena)
        .then((response) => (this.empresas = response.data))
        .catch((error) => console.log(error.response));
    },
    CargarEmpresas() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) {
        $router.push("/login");
      }

      const urlEmpresasActivas =
        "https://localhost:7030/Empresa/getEmpresasPorUsuario";
      const paramsEmpresasActivas = {
        params: {
          idUsuario: token.userId,
        },
      };
      axios
        .get(urlEmpresasActivas, paramsEmpresasActivas)
        .then((response) => {
          this.empresas = response.data;
          return empresas;
        })
        .catch((error) => {
          console.log(error.response);
        });
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

<style scoped="scoped">

.v-main { padding: 0 !important; }

</style>
