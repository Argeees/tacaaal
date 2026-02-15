export default function ApplicationLogo(props) {
    return (
        <img
            src="/images/logo.png"
            alt="Logo Institucional"
            className="h-40 w-auto object-contain"
            {...props}
        />
    );
}