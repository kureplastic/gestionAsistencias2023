'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Asistencia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Asistencia.hasOne(models.Usuario, {
        foreignKey: 'id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'      
      });
      Asistencia.hasOne(models.Materia, {
        foreignKey: 'id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'      
      });
    }
  }
  Asistencia.init({
    alumnoId: DataTypes.INTEGER,
    materiaId: DataTypes.INTEGER,
    horarioClase: DataTypes.DATE,
    horarioAsistencia: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Asistencia',
  });
  return Asistencia;
};