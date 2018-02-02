const graphql = require('graphql');
const _ = require('lodash');
const axios = require('axios');

const{
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType
} = graphql;


const ContractType = new GraphQLObjectType({
  name:'Contract',
  fields:()=>({
    id:{type: GraphQLString},
    status: { type: GraphQLString },
    createdBy: { type: GraphQLString },
    signedDate: { type: GraphQLString }
  })
})

/* Se crea un Schema con la definición de la estructura del cliente que reflejará por el momento la colección clients del db.json */

const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    secondName: { type: GraphQLString },
    fatherName: { type: GraphQLString },
    motherName: { type: GraphQLString },
    age: { type: GraphQLInt },
    contract: {
      type: ContractType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/contracts/${parentValue.contractId}`)
          .then(resp => resp.data);
      }
    }

  })
});


//Se crea el Schema que define la estructura del empleado y se refleja en la colección "employees" del db.json
const EmployeeType = new GraphQLObjectType ({
  name: 'Employee',
  fields: () => ( {
    id:{ type: GraphQLString },
    firstName: { type: GraphQLString },
    secondName: { type: GraphQLString },
    fatherName: { type: GraphQLString },
    motherName: { type: GraphQLString },
    age: { type: GraphQLInt },
    employeeType: { type: GraphQLString },
    isActive: { type: GraphQLBoolean },
// El campo "plant" busca en la colección de plantas para responder con la planta o tienda, a la cual el empleado está asignado
    plant: {
      type: PlantType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/plants/${parentValue.plantId}`)
          .then(resp => resp.data);
      }
    },
// El campo "department" busca en la colección de departamentos para responder con el departamento al cual el empleado está asignado
    department: {
      type: DepartmentType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/departments/${parentValue.deptId}`)
          .then(resp => resp.data);
      }
    },
// El campo "schedule" busca en la colección de horarios para responder con los horarios a los cuales el empleado está asignado
    schedule: {
      type: ScheduleType,
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/schedules/${parentValue.scheduleId}`)
          .then(resp => resp.data);
      }
    },
    items: { type: EmployeeType},
    totalCount:  {type: GraphQLInt }

  })
});

const CountClientsType = new GraphQLObjectType({
  name: 'TotalCount',
  fields: () => ({
    items: {
      type: new GraphQLList(ClientType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/clients`)
          .then(resp => resp.data);
      }
    },
    totalCount: {
      type: GraphQLInt,
      resolve() {
        return axios.get(`http://localhost:3000/clients`)
          .then(resp => resp.data.length);
      }
    }
  })
});

const ClientInputType = new GraphQLInputObjectType({
  name: 'ClientInput',
  description: 'Input client payload',
  fields: () => ({
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    fatherName: {
      type: GraphQLString,
    },
    motherName: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    }
  }),
});

//RootQuery define las acciones "GET" que nuestra API podrá hacer
const RootQuery = new GraphQLObjectType ({
  name: 'RootQueryType',
  fields: {
    client: {
      type: ClientType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/clients/${args.id}`)
          .then(resp => resp.data);
      }
    },
    allClients: {
      type: new GraphQLList(ClientType) ,
      resolve() {
        return axios.get(`http://localhost:3000/clients`)

          .then(resp => resp.data);

      }
    },
    countClients: {
      type: CountClientsType,
      resolve() {
        return axios.get(`http://localhost:3000/clients`)

          .then(resp => resp.data);

      }
    },
    contract: {
      type: ContractType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/contracts/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

//Mutation define las acciones POST, DELETE, PUT y PATCH que nuestra API podrá hacer
const mutation = new GraphQLObjectType ({
  name: 'Mutation',
  fields: {
    createClient: {
      type: ClientType,
      args: {
        firstName: { type: GraphQLString },
        secondName: { type: GraphQLString },
        fatherName: { type: GraphQLString },
        motherName: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve(parentValue,args){
        console.log(args);
        var axiosPet= axios({
          method: 'post',
          url: 'http://localhost:3000/clients',
          data: args,
        });
        return axiosPet.then(res => res.data);
      }
    },
    //DELETE de empleados
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }){
        return axios.delete(`http://localhost:3000/clients/${id}`)
          .then(res => res.data)
          .catch(res =>{
            console.log(res);
          } )
      }
    },
    //UPDATE de empleados
    editClient: {
      type: ClientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString)},
        firstName: { type: GraphQLString },
        secondName: { type: GraphQLString },
        fatherName: { type: GraphQLString },
        motherName: { type: GraphQLString },
        age: { type: GraphQLInt }
      },
      resolve(parentValue, args){
        return axios.patch(`http://localhost:3000/clients/${args.id}`, args)
          .then(resp => resp.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation
});
