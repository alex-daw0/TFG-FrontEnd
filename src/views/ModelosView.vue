<template>
  <v-app>
    <toggleMenu />
    <v-main class="contenedor">
      <v-container>
        <h1 class="text-center">Registro de Modelos</h1>

        <v-row>
          <v-col cols="12">
            <v-select dense :items="MarcasParaFiltros" item-text="nombre" label="Filtro marca" item-value="id"
              v-model="marcaFilter" @change="ActualizarTablaResetPages">
              <template v-slot:item="{ props, item }">
                {{ item.nombre }}
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" class="text-right">
            <v-btn icon @click="refreshFiltros">
              <v-icon color="var(--primary-color)">mdi-refresh</v-icon>
            </v-btn>
          </v-col>
        </v-row>



        <v-data-table :headers="headers" :items="modelos" item-key="id" :items-per-page="pagination.rowsPerPage"
          hide-default-footer hide-default-header @click:column="handleSort" class="elevation-1" >

          <!-- Como queremos realizar nuestra ordenación desde el back, nos desharemos del header por defecto de vuetify el cual incluye por si mismo una paginación desde el FronEnd -->
          <template v-slot:header>
            <thead>
              <tr class="centered-header">
                <th @click="handleSort('nombre')" style="text-align: center">Nombre</th>
                <th @click="handleSort('marca')" style="text-align: center">Marca</th>

                <th><v-btn class="AddModelo" style="background-color: var(--primary-color); color: white; margin:auto" @click="
                  dialogInsert = true;
                AddModelo();
                "><v-icon>mdi-plus</v-icon></v-btn></th>
              </tr>
            </thead>
          </template>




          <template v-slot:item.nombre="{ item }">{{ item.nombre }}</template>
          <template v-slot:item.marca="{ item }">{{ item.marca }}</template>


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

        <!-- Modal para inserción de modelos -->

        <v-dialog v-model="dialogInsert" width="700">
          <v-card>
            <h2 class="text-center">Añadir Modelo</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error)" class="errores text-center">Debes rellenar
                todos los
                campos</h2>
              <form>
                <v-text-field v-model="insertNombre" label="nombre"></v-text-field>

                <v-select :items="itemsMarca" item-text="nombre" item-value="id" label="Marca" v-model="insertMarca"
                  >
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmAddModelo">Confirmar</button>
                <button @click="dialogInsert = false">Cerrar</button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Fin del modal de inserción de modelos -->

        <!-- Modal para la edición de modelos -->

        <v-dialog v-model="dialogUpdate" width="700">
          <v-card>
            <h2 class="text-center">Editar Modelo</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error)" class="errores text-center">Debes rellenar
                todos los
                campos</h2>

              <form>
                <v-text-field v-model="nombreEdit" label="nombre"></v-text-field>

                <v-select :items="itemsMarca" item-text="nombre" item-value="id" label="Marca" v-model="marcaEdit"
                  >
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmEditar">Confirmar</button>
                <button @click="dialogUpdate = false">Cerrar</button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Fin del modal para la edición de modelos -->

        <!-- Modal para eliminación de modelos -->
        <v-dialog v-model="dialogDelete" width="500">
          <v-card>
            <h2 class="text-center">Quieres borrar este modelo?</h2>
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
        <!-- Fin de modal para eliminación de modelos -->
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
      itemsMarca: [],
      headers: [
        { text: "Nombre", value: "nombre", align:"center" },
        { text: "Marca", value: "marca", align:"center" },
        { text: "EditDelete", value: "editDelete", align:"center" },
      ],
      perPageChoices: [
        { text: '5 Modelos/página', value: 5 },
        { text: '10 Modelos/página', value: 10 },
        { text: '20 Modelos/página', value: 20 },
      ],
      opcionesOrder: [
        { text: 'Nombre asc', value: 'nombre asc' },
        { text: 'Nombre desc', value: 'nombre desc' },
        { text: 'Marca asc', value: 'marca asc' },
        { text: 'Marca desc', value: 'marca desc' },
      ],
      modelos: [],
      ModeloAEditar: "",
      ModeloAEliminar: "",
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
      marcaFilter: "",


      /*Elementos de insercion y edición */
      nombreEdit: "",
      marcaEdit: "",

      itemsMarca: [],


      insertNombre: "",
      insertMarca: "",
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
          Marca: this.marcaFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy + " " + (this.pagination.sortDesc ? 'desc' : 'asc')
        }
      };
      const url = `https://localhost:7030/Modelo/getModelos`;

      axios
        .get(url, params)
        .then((response) => {
          this.modelos = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
          this.pagination.page = JSON.parse(response.headers['x-pagination']).CurrentPage;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    AddModelo() {
      const token = JSON.parse(localStorage.getItem('token'));
      if (!token) this.$router.push('/login');
    },
    ConfirmEditar() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      if (this.nombreEdit == '' || this.marcaEdit == undefined) {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Modelo/updateModelo?id=${this.ModeloAEditar}&idEditor=${token.userId}`;

        const params = {
          id: this.ModeloAEditar,
          nombre: this.nombreEdit,
          idMarca: this.marcaEdit,
          IdModelo: this.modeloEdit,
          Id_TipoCombustible: this.combustibleEdit,
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
      this.ModeloAEliminar = id;
    },
    ConfirmDelete() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      axios
        .delete(
          `https://localhost:7030/Modelo/deleteModelo?id=${this.ModeloAEliminar}&idBorrador=${token.userId}`
        )
        .then((response) => {
          this.$router.go(0);
        })
        .catch((error) => console.log(error.response));
    },
    refreshFiltros() {
      if (!localStorage.getItem('token')) this.$router.push('/login');
      this.nombreFilter = "";
      this.marcaFilter = "";
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
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');
      const params = {
        params: {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.rowsPerPage,
          Nombre: this.nombreFilter,
          Marca: this.marcaFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy
        }
      };
      const url = `https://localhost:7030/Modelo/getModelos`;

      axios
        .get(url, params)
        .then((response) => {
          this.modelos = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },

    ConfirmAddModelo() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      const params = {
        nombre: this.insertNombre,
        idMarca: this.insertMarca,
        IdEmpresa: token.idEmpresa,
        idCreador: token.userId,
      };

      if (this.insertNombre == '' || this.insertMarca == undefined) {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Modelo/postModelo?idCreador=${token.userId}`;
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
      this.marcaEdit = item['idMarca'];
      this.ModeloAEditar = item.id;
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
    const token = JSON.parse(localStorage.getItem("token"));
    const params = {
      params: {
        PageNumber: this.pagination.page,
        PageSize: this.pagination.rowsPerPage
      }
    };
    const url = `https://localhost:7030/Modelo/getModelos?idEmpresa=${token.idEmpresa}`;

    axios
      .get(url, params)
      .then((response) => {
        this.modelos = response.data;
        this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
        this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
        this.pagination.page = JSON.parse(response.headers['x-pagination']).CurrentPage;
      })
      .catch((error) => {
        console.log(error.response);
      });

    

        axios
          .get(`https://localhost:7030/Marca/getMarcas?idEmpresa=${token.idEmpresa}`)
          .then((response) => {
            this.itemsMarca = response.data;
            this.MarcasParaFiltros = response.data;
          })
          .catch((error) => console.log(error.response));
        }


};
</script>

<style scoped>

.AddModelo {
  display: block !important;
  text-align: center !important;
  }

th { cursor: pointer; }

.v-main { padding: 0 !important; }

.pagination { margin-top: .5rem; }

</style>
