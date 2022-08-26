export default function (_Context) {


    return {
        splitPath: function (_path) {
            const pathStrSplit = _path.split('/')
            const fileName = pathStrSplit.pop()
            const directoryName = pathStrSplit.join('/')

            return {
                fileName: fileName,
                directoryName: directoryName
            }
        },
        clearChileNode : function (_parent) {
            while (_parent.firstChild) {
                _parent.removeChild(_parent.firstChild);
            }
        }
    }


}