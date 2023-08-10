# do-ddd

`do-ddd` is a command-line tool designed to automate domain driven design abstractions on code. It generates scaffolding for your DDD-based Node.js projects. It can - 
1. Generate scaffolding for Controller and UseCase files based on RequestType and ResponseType files. 

## Features
1. Analyzes user-defined Request and Response Types and generates corresponding UseCase and Controller files.
2. TypeScript compatible.
3. Utilizes AST manipulation for smart code generation.

## How to Install
You can install do-ddd globally using npm:
```
npm install -g do-ddd
```

## Usage

Once installed, you can use the `do-ddd` command to generate the necessary files. Here's how it works:


1. **Defined your Request and Response Types**
   - `I[SomethingSomething]Request.ts`
   - `I[SomethingSomething]Response.ts`

**IAuthenticationRequest.ts**
```
export const IAuthenticationRequest = {userEmail: String, password: String}
```

**IAuthenticationResponse.ts**
```
export const IAuthenticationResponse = {authCode: String}
```

2. **Run the following command in the directory containing these files:**

```bash
do-ddd generate
```

This will create:
- `[SomethingSomething]UseCase.ts`
- `[SomethingSomething]Controller.ts`

## Development

To contribute or modify the project, you can clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/do-ddd.git
cd do-ddd
npm install
```

**Build the project:**

```bash
npm run build
```

**Link the project for local testing:**

```bash
npm run link
```

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Author

[josharsh](https://github.com/josharsh)