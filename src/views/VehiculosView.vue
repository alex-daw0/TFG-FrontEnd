<template>
  <v-app style="background-color: #fcfcfc;">
    <toggleMenu />
    <v-main class="contenedor">
      <v-container>
        <h1 class="text-center">Registro de Vehículos</h1>

        <v-row>
          <v-col cols="12" sm="4">
            <v-select dense :items="MarcasParaFiltros" item-text="nombre" label="Filtro marca" item-value="id"
              v-model="marcaFilter" @change="getModelosParaFiltros">
              <template v-slot:item="{ props, item }">
                {{ item.nombre }}
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select dense :items="ModelosParaFiltros" item-text="nombre" label="Filtro modelo" item-value="id"
              v-model="modeloFilter" @change="ActualizarTablaResetPages">
              <template v-slot:item="{ props, item }">
                {{ item.nombre }}
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select dense :items="CombustiblesParaFiltros" item-text="nombre" label="Filtro combustible"
              item-value="id" v-model="combustibleFilter" @change="ActualizarTablaResetPages">
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



        <v-data-table :headers="headers" :items="vehiculos" item-key="id" :items-per-page="pagination.rowsPerPage"
          hide-default-footer hide-default-header @click:column="handleSort" class="elevation-1" :mobile-breakpoint='0'>

          <!-- Como queremos realizar nuestra ordenación desde el back, nos desharemos del header por defecto de vuetify el cual incluye por si mismo una paginación desde el FronEnd -->          
          <template v-slot:header>
            <thead>
              <tr class="centered-header">
                <th @click="handleSort('matricula')" width="20%" style="text-align: center">Matrícula</th>
                <th @click="handleSort('marca')" width="20%" style="text-align: center">Marca</th>
                <th @click="handleSort('modelo')" width="20%" style="text-align: center">Modelo</th>
                <th @click="handleSort('tipocombustible')" width="20%" style="text-align: center">Combustible</th>
                <th width="20%" ><v-btn class="addVehiculo" style="background-color: var(--primary-color); color: white; margin: auto" @click="
                  dialogInsert = true;
                AddVehiculo();
                "><v-icon>mdi-plus</v-icon></v-btn></th>
              </tr>
            </thead>
          </template>




          <template v-slot:item.matricula="{ item }">{{ item.matricula }}</template>
          <template v-slot:item.marca="{ item }">{{ item.marca }}</template>
          <template v-slot:item.modelo="{ item }">{{ item.modelo }}</template>
          <template v-slot:item.combustible="{ item }">{{ item.combustible }}</template>

          <template class="botonesTabla" v-slot:item.editDelete="{ item }">
            <span @click="
              Editar(item);
            dialogUpdate = true;
            "><v-icon style="color: var(--accent)" v-on:click="getModelosPorMarcaEdit(item)">mdi-pen</v-icon>
            </span>
            <span @click="
              Borrar(item.id);
            dialogDelete = true;
            "><v-icon style="color: #f91b49">mdi-delete</v-icon></span>

          </template>


        </v-data-table>
        <v-row class="pagination">
          <v-col cols="6" md="3">
            <v-text-field outlined dense type="text" v-model="matriculaFilter" placeholder="Buscar por matricula"
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

        <!-- Modal para inserción de vehículos -->

        <v-dialog v-model="dialogInsert" width="700">
          <v-card>
            <h2 class="text-center">Añadir vehiculo</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error);" class="errores text-center">Debes rellenar
                todos los
                campos</h2>
              <form>
                <v-text-field v-model="insertMatricula" label="Matricula"></v-text-field>

                <v-select :items="itemsMarca" item-text="nombre" item-value="id" label="Marca" v-model="insertMarca"
                  v-on:change="getModelosPorMarca()">
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>

                <v-select :items="itemsModelo" item-text="nombre" item-value="id" label="Modelo" v-model="insertModelo">
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>

                <v-select :items="itemsCombustible" item-text="nombre" item-value="id" label="Combustible"
                  v-model="insertCombustible">
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>
              </form>
              <div class="botonesModal">
                <button @click="ConfirmAddVehiculo">Confirmar</button>
                <button @click="dialogInsert = false">Cerrar</button>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Fin del modal de inserción de vehículos -->

        <!-- Modal para la edición de vehículos -->

        <v-dialog v-model="dialogUpdate" width="700">
          <v-card>
            <h2 class="text-center">Editar vehiculo</h2>
            <v-card-text>
              <h2 style="color: black; display: none; padding: .7rem; background-color: var(--error)" class="errores text-center">Debes rellenar
                todos los
                campos</h2>

              <form>
                <v-text-field v-model="matriculaEdit" label="Matricula"></v-text-field>

                <v-select :items="itemsMarca" item-text="nombre" item-value="id" label="Marca" v-model="marcaEdit"
                  v-on:change="getModelosPorMarcaChangeEdit()">
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>

                <v-select :items="itemsModeloEdit" item-text="nombre" item-value="id" label="Modelo"
                  v-model="modeloEdit">
                  <template v-slot:item="{ props, item }">
                    {{ item.nombre }}
                  </template>
                </v-select>

                <v-select :items="itemsCombustible" item-text="nombre" item-value="id" label="Combustible"
                  v-model="combustibleEdit">
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

        <!-- Fin del modal para la edición de vehículos -->

        <!-- Modal para eliminación de vehículos -->
        <v-dialog v-model="dialogDelete" width="500">
          <v-card>
            <h2 class="text-center">Quieres borrar este vehículo?</h2>
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
        <!-- Fin de modal para eliminación de vehículos -->
      </v-container>
    </v-main>
    <pie />
  </v-app>
</template>

<script>
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
      itemsModelo: [],
      itemsCombustible: [],
      headers: [
        { text: "Matrícula", value: "matricula", align: "center"  },
        { text: "Marca", value: "marca", align: "center"  },
        { text: "Modelo", value: "modelo", align: "center"  },
        { text: "Combustible", value: "combustible", align: "center"  },
        { text: "EditDelete", value: "editDelete", align: "center" },
      ],
      perPageChoices: [
        { text: '5 vehiculos/página', value: 5 },
        { text: '10 vehiculos/página', value: 10 },
        { text: '20 vehiculos/página', value: 20 },
      ],
      opcionesOrder: [
        { text: 'Matricula asc', value: 'matricula asc' },
        { text: 'Matricula desc', value: 'matricula desc' },
        { text: 'Marca asc', value: 'marca asc' },
        { text: 'Marca desc', value: 'marca desc' },
        { text: 'Modelo asc', value: 'modelo asc' },
        { text: 'Modelo desc', value: 'modelo desc' },
        { text: 'Combustible asc', value: 'TipoCombustible asc' },
        { text: 'Combustible desc', value: 'TipoCombustible desc' },
      ],
      vehiculos: [],
      vehiculoAEditar: "",
      vehiculoAEliminar: "",
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 10,
        sortBy: "matricula",
        totalItems: undefined,
        totalPages: undefined
      },
      /*Elementos de filtrado */
      MarcasParaFiltros: [],
      ModelosParaFiltros: [],
      CombustiblesParaFiltros: [],

      matriculaFilter: "",
      marcaFilter: "",
      modeloFilter: "",
      combustibleFilter: "",

      /*Elementos de insercion y edición */
      matriculaEdit: "",
      marcaEdit: "",
      modeloEdit: "",
      combustibleEdit: "",

      itemsCombustible: [],
      itemsMarca: [],
      itemsModelo: [],
      itemsModeloEdit: [],

      insertMatricula: "",
      insertMarca: "",
      insertModelo: "",
      insertCombustible: "",
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
          Matricula: this.matriculaFilter,
          Marca: this.marcaFilter,
          Modelo: this.modeloFilter,
          Combustible: this.combustibleFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy + " " + (this.pagination.sortDesc ? 'desc' : 'asc')
        }
      };
      const url = `https://localhost:7030/Vehiculo/GetAllVehiculos`;

      axios
        .get(url, params)
        .then((response) => {
          this.vehiculos = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
          this.pagination.page = JSON.parse(response.headers['x-pagination']).CurrentPage;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    AddVehiculo() {
      const token = JSON.parse(localStorage.getItem('token'));
      if (!token) this.$router.push('/login');
    },
    getModelosParaFiltros() {
      const token = JSON.parse(localStorage.getItem('token'));
      this.modeloFilter = '';

      axios
        .get(`https://localhost:7030/Modelo/getModelos?Marca=${this.marcaFilter}&idEmpresa=${token.idEmpresa}`)
        .then((response) => (this.ModelosParaFiltros = response.data))
        .catch((error) => console.log(error.response));
        this.ActualizarTablaResetPages();
    },
    getModelosPorMarca() {
      this.insertModelo = null;
      const token = JSON.parse(localStorage.getItem("token"));

      axios
        .get(`https://localhost:7030/Modelo/getModelos?Marca=${this.insertMarca}&idEmpresa=${token.idEmpresa}`)
        .then((response) => (this.itemsModelo = response.data))
        .catch((error) => console.log(error.response));
    },
    getModelosPorMarcaEdit(item) {
      const token = JSON.parse(localStorage.getItem("token"));

      axios
        .get(`https://localhost:7030/Modelo/getModelos?Marca=${item.idMarca}&idEmpresa=${token.idEmpresa}`)
        .then((response) => (this.itemsModeloEdit = response.data))
        .catch((error) => console.log(error.response));
    },
    getModelosPorMarcaChangeEdit() {
      const token = JSON.parse(localStorage.getItem("token"));

      this.modeloEdit = null;
      axios
        .get(`https://localhost:7030/Modelo/getModelos?Marca=${this.marcaEdit}&idEmpresa=${token.idEmpresa}`)
        .then((response) => (this.itemsModeloEdit = response.data))
        .catch((error) => console.log(error.response));
    },
    ConfirmEditar() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      if (this.matriculaEdit == '' || this.modeloEdit == undefined || this.marcaEdit == undefined || this.combustibleEdit == undefined) {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Vehiculo/updateVehiculo?id=${this.vehiculoAEditar}&idEditor=${token.userId}`;

        const params = {
          id: this.vehiculoAEditar,
          matricula: this.matriculaEdit,
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
      this.vehiculoAEliminar = id;
    },
    ConfirmDelete() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      axios
        .delete(
          `https://localhost:7030/Vehiculo/deleteVehiculo?id=${this.vehiculoAEliminar}&idBorrador=${token.userId}`
        )
        .then((response) => {
          this.$router.go(0);
        })
        .catch((error) => console.log(error.response));
    },
    refreshFiltros() {
      if (!localStorage.getItem('token')) this.$router.push('/login');
      this.matriculaFilter = "";
      this.marcaFilter = "";
      this.ModelosParaFiltros = null;
      this.modeloFilter = "";
      this.combustibleFilter = "";
      this.pagination['sortBy'] = "matricula";
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
          Matricula: this.matriculaFilter,
          Marca: this.marcaFilter,
          Modelo: this.modeloFilter,
          Combustible: this.combustibleFilter,
          idEmpresa: token.idEmpresa,
          OrderBy: this.pagination.sortBy
        }
      };
      const url = `https://localhost:7030/Vehiculo/GetAllVehiculos`;

      axios
        .get(url, params)
        .then((response) => {
          this.vehiculos = response.data;
          this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
          this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
        })
        .catch((error) => {
          console.log(error.response);
        });

        
    },

    ConfirmAddVehiculo() {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) this.$router.push('/login');

      const params = {
        Matricula: this.insertMatricula,
        id_TipoCombustible: this.insertCombustible,
        idMarca: this.insertMarca,
        IdModelo: this.insertModelo,
        IdEmpresa: token.idEmpresa,
        idCreador: token.userId,
      };

      if (this.insertMatricula == '' || this.insertModelo == undefined || this.insertMarca == undefined || this.insertCombustible == undefined) {
        document.querySelector('.errores').style.display = "block";
      } else {
        document.querySelector('.errores').style.display = "none";
        const url = `https://localhost:7030/Vehiculo/postVehiculo?idCreador=${token.userId}`;
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

      this.matriculaEdit = item.matricula;
      this.marcaEdit = item['idMarca'];
      this.modeloEdit = item['idModelo'];
      this.combustibleEdit = item['id_TipoCombustible'];
      this.vehiculoAEditar = item.id;
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
    const url = `https://localhost:7030/Vehiculo/GetAllVehiculos?idEmpresa=${token.idEmpresa}`;

    axios
      .get(url, params)
      .then((response) => {
        this.vehiculos = response.data;
        this.pagination.totalItems = JSON.parse(response.headers['x-pagination']).TotalCount;
        this.pagination.totalPages = JSON.parse(response.headers['x-pagination']).TotalPages;
        this.pagination.page = JSON.parse(response.headers['x-pagination']).CurrentPage;
      })
      .catch((error) => {
        console.log(error.response);
      });

    axios
      .get(`https://localhost:7030/Combustible/getCombustibles?idEmpresa=${token.idEmpresa}`)
      .then((response) => {
        this.itemsCombustible = response.data;
        this.CombustiblesParaFiltros = response.data;

        axios
          .get(`https://localhost:7030/Marca/getMarcas?idEmpresa=${token.idEmpresa}`)
          .then((response) => {
            this.itemsMarca = response.data;
            this.MarcasParaFiltros = response.data;
          })
          .catch((error) => console.log(error.response));
      })
      .catch((error) => console.log(error.response));
  }

};
</script>

<style scoped>

.addVehiculo {
  display: block !important;
  text-align: center !important;
  }

th { cursor: pointer; }

.v-main { padding: 0 !important; }

.pagination { margin-top: .5rem; }

</style>
