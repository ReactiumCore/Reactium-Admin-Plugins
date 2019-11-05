module.exports = ({ params, Parse }) => {
    const { app, server } = params;
    Parse.initialize(app);
    Parse.serverURL = server;
};
