'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Horario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Horario.belongsTo(models.Materia, {
        foreignKey: 'materiaId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'    
      });
    }
  }
  Horario.init({
    materiaId: DataTypes.INTEGER,
    fechaInicio: DataTypes.DATE,
    fechaFin: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Horario',
  });
  return Horario;
};