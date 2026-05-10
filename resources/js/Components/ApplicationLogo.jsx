// 1. Subimos 3 niveles (../../../) para salir de Components, js y resources, y luego entramos a public/images
import logoImg from '../../../public/images/logo.png';

export default function ApplicationLogo(props) {
    return (
        // 2. Le pasamos la variable importada al atributo src
        <img {...props} src={logoImg} alt="Logo TECAAL" />
    );
}