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
        args.contractId = "C00001";
        var axiosPet= axios({
          method: 'post',
          url: 'http://localhost:3000/clients',
          data: args,
        });
        return axiosPet.then(res => res.data);
      }
    },
    //DELETE de clientes
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
    //UPDATE de clientes
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
