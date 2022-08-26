export default function (_Context) {

    const menuBar = document.querySelector('#top-container .navbar')
    //상단 메뉴바 처리
    menuBar.addEventListener('mouseover', (e) => {
        // console.log(e.target)
        let parent = e.target.parentElement
        if (parent.classList.contains('dropdown')) {
            e.target.parentElement.querySelector('.dropdown-content').classList.remove('close')
        }
    });

    //선택되면 활성 메뉴 닫기 
    menuBar.addEventListener('click', (e) => {
        // console.log(e.target)
        e.target.parentElement.classList.add('close')
    });
    /////
}