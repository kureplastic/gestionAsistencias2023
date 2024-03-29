'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AlumnoMateria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AlumnoMateria.hasOne(models.Usuario, {
        foreignKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'      
      });
      AlumnoMateria.hasOne(models.Materia, {
        foreignKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'      
      });
    }
  }
  AlumnoMateria.init({
    alumnoId: DataTypes.INTEGER,
    materiaId: DataTypes.INTEGER,
    validacion: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AlumnoMateria',
  });
  return AlumnoMateria;
};