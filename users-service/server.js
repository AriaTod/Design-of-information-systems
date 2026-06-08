const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const gql = require('graphql-tag');

const users = require('./data/users');

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
    }

    type Mutation {
        createUser(name: String!): User!
        updateUser(id: ID!, name: String!): User
        deleteUser(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        users: () => users,

        user: (_, { id }) => {
            return users.find(user => user.id === id);
        }
    },

    Mutation: {
        createUser: (_, { name }) => {
            const newUser = {
                id: String(users.length + 1),
                name
            };

            users.push(newUser);

            return newUser;
        },

        updateUser: (_, { id, name }) => {
            const user = users.find(user => user.id === id);

            if (!user) {
                return null;
            }

            user.name = name;

            return user;
        },

        deleteUser: (_, { id }) => {
            const index = users.findIndex(user => user.id === id);

            if (index === -1) {
                return false;
            }

            users.splice(index, 1);

            return true;
        }
    }
};

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({
            typeDefs,
            resolvers
        })
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4001 }
    });

    console.log(`Users Service running at ${url}`);
}

startServer();