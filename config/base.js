const { Sequelize } = require('sequelize');

module.exports = new Sequelize('gestion_asistencias2023', 'root', '', {
	host: 'localhost',
	dialect: 'mysql'
  });
