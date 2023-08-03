function ExportToExcel(type, fn, dl) {
            var elt = document.getElementById('TablaParaExportar');
            var wb = XLSX.utils.table_to_book(elt, { sheet: "asistencia" });
            return dl ?
                XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
                XLSX.writeFile(wb, fn || ('Asistencias2023.' + (type || 'xlsx')));
        }