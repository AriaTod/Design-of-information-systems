const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const gql = require('graphql-tag');

const orders = require('./data/orders');

const typeDefs = gql`
    type Order {
        id: ID!
        userId: ID!
        productId: ID!
    }

    type Query {
        orders: [Order!]!
        order(id: ID!): Order
    }

    type Mutation {
        createOrder(
            userId: ID!
            productId: ID!
        ): Order!

        updateOrder(
            id: ID!
            userId: ID!
            productId: ID!
        ): Order

        deleteOrder(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        orders: () => orders,

        order: (_, { id }) => {
            return orders.find(order => order.id === id);
        }
    },

    Mutation: {
        createOrder: (_, { userId, productId }) => {
            const newOrder = {
                id: String(orders.length + 1),
                userId,
                productId
            };

            orders.push(newOrder);

            return newOrder;
        },

        updateOrder: (_, { id, userId, productId }) => {
            const order = orders.find(
                order => order.id === id
            );

            if (!order) {
                return null;
            }

            order.userId = userId;
            order.productId = productId;

            return order;
        },

        deleteOrder: (_, { id }) => {
            const index = orders.findIndex(
                order => order.id === id
            );

            if (index === -1) {
                return false;
            }

            orders.splice(index, 1);

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
        listen: { port: 4003 }
    });

    console.log(`Orders Service running at ${url}`);
}

startServer();