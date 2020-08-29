interface loginProps {
    login: (req: any, res: any, next: () => void) => void
}

const loginRouter: loginProps = {
    login: (req: any, res: any, next: () => void) => {
        console.log(req.query);
        res.send(true);
    }
};

export default loginRouter;