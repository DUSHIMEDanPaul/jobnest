


const Footer = () => {
    return (
        <div>
            <footer className="footer p-10 bg-base-100 text-base-content">
                <nav>
                    <h6 className="footer-title text-sky-600">Services</h6>
                    <a className="link link-hover">On-Site</a>
                    <a className="link link-hover">Remote</a>
                    <a className="link link-hover">Hybrid</a>
                    <a className="link link-hover">Part-Time</a>
                </nav>
                <nav>
                    <h6 className="footer-title text-sky-600">Company</h6>
                    <a className="link link-hover">Skill Development</a>
                    <a className="link link-hover">Job PLacement</a>
                    <a className="link link-hover">Help</a>
                    <a className="link link-hover">Contact Us</a>
                </nav>
                <nav>
                    <h6 className="footer-title text-sky-600">Legal</h6>
                    <a className="link link-hover">Terms of use</a>
                    <a className="link link-hover">Privacy policy</a>
                    <a className="link link-hover">Cookie policy</a>
                </nav>
            </footer>
            <footer className="footer px-10 py-4 border-t bg-base-200 text-base-content border-base-300">
                
                <nav className="md:place-self-center md:justify-self-end">
                    
                </nav>
            </footer>
        </div>
    );
};

export default Footer;
