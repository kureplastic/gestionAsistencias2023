'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Materia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Materia.belongsTo(models.Usuario, {
        foreignKey: 'profesorId'      
      });
      Materia.belongsToMany(models.Usuario, { through: models.AlumnoMateria });
      Materia.hasMany(models.Horario);
    }
  }
  Materia.init({
    nombre: DataTypes.STRING,
    profesorId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Materia',
  });
  return Materia;
};