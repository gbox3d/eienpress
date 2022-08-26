# Curator's editor

## 설명

### 기본 요소 정의
* 갤러리 : 전시관을 다루는 개념 (gallery)
* 공간 : 전시관내 여러 공간을 분할하여 다루는 개념 (space)
* 오브잭트 : 공간내의 사물에 대한 개념 (object)
* 트리거 : 공간내 사물들의 상호 작용을 정읳하는 개념 (trigger)

### 오브잭트
type 번호 :  
0 : 유뮬  
1 : 인테리어  
2 : 건물  


### 기타
전시관(gallery)의 단위인 space를 편집하기 위한 관리툴.  
object3d json 형식으로 저장됨(추후에 glb 형식을 사용할 예정).  
space_dummy 노드아래로 오브잭트가 저장되어있음.  
파일에서 풀러온 씬은 다음과 같이하여 씬노드에 등록한다.  
```js
let sceneObj = await _Context.editor.fromJsonByUrl(
    {
        url: `${_Context.host_url}/com/file/download?path=${filepath}`,
        onProgress: (data) => {
            _Context.progressBox.update(data);
        }
    }
);

const space_dummy = sceneObj.getObjectByName("space_dummy")
console.log(space_dummy);
if(space_dummy){
    _Context.editor.addSpaceGroup(space_dummy);
}
```

root -+ space_dummy ----+-- 전시실 3d오브잭트
                        |
                        +-- 전시물 3d오브잭트
                        |
                        +-- 인테리어 3d오브잭트


