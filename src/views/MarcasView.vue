<template>
  <v-app>
    <toggleMenu />
    <v-main class="contenedor">
      <v-container>
        <h1 class="text-center">Registro de Marcas</h1>

      
          <v-col cols="12" class="text-right">
            <v-btn icon @click="refreshFiltros">
              <v-icon color="var(--primary-color)">mdi-refresh</v-icon>
            </v-btn>
          </v-col>



        <v-data-table :headers="headers" :items="marcas" item-key="id" :items-per-page="pagination.rowsPerPage"
          hide-default-footer hide-default-header @click:column="handleSort" class="elevation-1">

          <!-- Como queremos realizar nuestra ordenación desde el back, nos desharemos del header por defecto de vuetify el cual incluye por si mismo una paginación desde el FronEnd -->
          <template v-slot:header>
            <thead>
              <tr class="centered-header">
                <th @click="handleSort('nombre')" style="text-align: center">Nombre</th>
                <th><v-btn class="AddMarca" style="background-color: var(--primary-color); color: white; margin:auto" @click="
                  dialogInsert = true;
                AddMarca();
                "><v-icon>mdi-plus</v-icon></v-btn></th>
              </tr>
            </thead>
          </template>




          <template v-slot:item.nombre="{ item }">{{ item.nombre }}</template>

          <template class="botonesTabla" v-slot:item.editDelete="{ item }">
            <span @click="
              Editar(item);
            dialogUpdate = true;
            "><v-icon style="color: var(--accent)">mdi-pen</v-icon>
            </span>
            <span @click="
              Borrar(item.id);
            dialogDelete = true;
            "><v-icon style="color: #f91b49">mdi-delete</v-icon></span>

          </template>


        </v-data-table>
        <v-row class="pagination">
          <v-col cols="6" md="3">
            <v-text-field outlined dense type="text" v-model="nombreFilter" placeholder="Buscar por nombre"
              @input="ActualizarTablaResetPages"></v-text-field>
          </v-col>

          <v-col cols="6" md="3">
            <v-select dense outlined hide-details :value="this.pagination.rowsPerPage" label="Items per page"
              v-on:change="ActualizarTablaResetPages" v-model="pagination.rowsPerPage" :items="perPageChoices">
            </v-select>
          </v-col>

          <v-col cols="6" md="3">
            <v-pagination v-model="pagination.page" :length="pagination.totalPages"  @input="ActualizarTabla" color="var(--primary-color)" ></v-pagination>
          </v-col>


        </v-row>

        <!-- Modal para inserción de marcas -->

        <v-dialog v-model="dialogInsert" width="700">
          <v-card>
            <h2 class="text-center">Añadir Marca</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error);  " class="errores text-center">Debes rellenar
                todos los
                campos</h2>
              <form>
                <v-text-field v-model="insertNombre" label="Nombre"></v-text-field>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmAddMarca">Confirmar</button>
                <button @click="dialogInsert = false">Cerrar</button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Fin del modal de inserción de marcas -->

        <!-- Modal para la edición de marcas -->

        <v-dialog v-model="dialogUpdate" width="700">
          <v-card>
            <h2 class="text-center">Editar Marca</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error);  " class="errores text-center">Debes rellenar
                todos los
                campos</h2>

              <form>
                <v-text-field v-model="nombreEdit" label="Nombre"></v-text-field>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmEditar">Confirmar</button>
                <button @click="dialogUpdate = false">Cerrar</button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Fin del modal para la edición de marcas -->

        <!-- Modal para eliminación de marcas -->
        <v-dialog v-model="dialogDelete" width="500">
          <v-card>
            <h2 class="text-center">Quieres borrar este marca?</h2>
            <v-card-text>
              <form>

                <p class="text-center">
                  Si confirmas el borrado, no habrá forma de recuperar los datos.
                </p>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmDelete()">
                  Confirmar
                </button>
                <button @click="dialogDelete = false">
                  Cancelar
                </button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
        <!-- Fin de modal para eliminación de marcas -->
      </v-container>
    </v-main>
    <pie />
  </v-app>
</template>

<script>
import { ref, computed, onMounted, reactive } from "vue";
import $router from "/src/router/index.ts";
import axios from "axios";
export default {
  components: {
    pie: () => import('../components/Footer.vue'),
    toggleMenu: () => import('../components/ToggleMenu.vue')
  },


  data: () => {
    return {
      dialogInsert: false,
      dialogDelete: false,
      dialogUpdate: false,
      headers: [
        { text: "Nombre", value: "nombre", align:"center" },
        { text: "EditDelete", value: "editDelete", align:"center" },
      ],
      perPageChoices: [
        { text: '5 marcas/página', value: 5 },
        { text: '10 marcas/página', value: 10 },
        { text: '20 marcas/página', value: 20 },
      ],
      opcionesOrder: [
        { text: 'Nombre asc', value: 'nombre asc' },
        { text: 'Nombre desc', value: 'nombre desc' },
      ],
      marcas: [],
      marcaAEditar: "",
      marcaAEliminar: "",
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 5,
        sortBy: "nombre",
        totalItems: undefined,
        totalPages: undefined
      },
      /*Elementos de filtrado */
      MarcasParaFiltros: [],
      nombreFilter: "",
      /*Elementos de insercion y edición */
      nombreEdit: "",
      insertNombre: "",
    };
  },
  methods: {
    fetchData() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');
      const params = {
        params: {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.rowsPerPage,
          Nombre: this.nombreFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy + " " + (this.pagination.sortDesc ? 'desc' : 'asc')
        }
      };
      const url = `https://localhost:7030/Marca/GetMarcas`;

      axios
        .get(url, params)
        .then((response) => {
          this.marcas = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
          this.pagination.page = JSON.parse(response.headers['x-pagination']).CurrentPage;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    AddMarca() {
      const token = JSON.parse(localStorage.getItem('token'));
      if (!token) this.$router.push('/login');
    },
    ConfirmEditar() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      if (this.nombreEdit == '') {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Marca/updateMarca?id=${this.marcaAEditar}&idEditor=${token.userId}`;

        const params = {
          id: this.marcaAEditar,
          nombre: this.nombreEdit,
          idEmpresa: token.idEmpresa,
          idEditor: token.userId,
        };

        axios
          .put(url, params)
          .then((response) => {
            this.$router.go(0);
          })
          .catch((error) => console.log(error.response));
      }
    },
    Borrar(id) {
      if (!localStorage.getItem('token')) this.$router.push('/login');
      this.marcaAEliminar = id;
    },
    ConfirmDelete() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      axios
        .delete(
          `https://localhost:7030/Marca/deleteMarca?id=${this.marcaAEliminar}&idBorrador=${token.userId}`
        )
        .then((response) => {
          this.$router.go(0);
        })
        .catch((error) => console.log(error.response));
    },
    refreshFiltros() {
      if (!localStorage.getItem('token')) this.$router.push('/login');
      this.nombreFilter = "";
      this.pagination['sortBy'] = "nombre";
      this.pagination['page'] = 1;
      this.pagination['rowsPerPage'] = 5;
      this.ActualizarTabla();
    },
    ActualizarTablaResetPages() {
      this.pagination.page = 1;
      this.ActualizarTabla();
    },
    ActualizarTabla() {
      console.log(this.pagination);
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');
      const params = {
        params: {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.rowsPerPage,
          Nombre: this.nombreFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy
        }
      };
      const url = `https://localhost:7030/Marca/GetMarcas`;

      axios
        .get(url, params)
        .then((response) => {
          this.marcas = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    ConfirmAddMarca() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      const params = {
        Nombre: this.insertNombre,
        IdEmpresa: token.idEmpresa,
        idCreador: token.userId,
      };

      if (this.insertNombre == '') {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Marca/postMarca?idCreador=${token.userId}`;
        axios
          .post(url, params)
          .then((response) => {
            this.$router.go(0);
          })
          .catch((error) => {
            console.log(error.response);
          });
      }
    },

    Editar(item) {
      if (!localStorage.getItem('token')) this.$router.push('/login');
      this.nombreEdit = item.nombre;
      this.marcaAEditar = item.id;
    },

    handleSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.sortDesc = !this.pagination.sortDesc;
      } else {
        this.pagination.sortBy = column;
        this.pagination.sortDesc = false;
      }

      this.fetchData();
    },

  },

  mounted() {
    this.fetchData()
  }

};
</script>

<style scoped>

.AddMarca {
  display: block !important;
  text-align: center !important;
}

th { cursor: pointer; }

.v-main { padding: 0 !important; }

.pagination { margin-top: .5rem; }

</style>
