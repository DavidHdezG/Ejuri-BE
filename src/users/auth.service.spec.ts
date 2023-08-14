import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { QrhistoricService } from "src/api/qrhistoric/qrhistoric.service";
const fakeUsersService = {
    find:()=>Promise.resolve([]),
    create:(email:string,password:string)=>Promise.resolve({id:1,email,password})

}
it('can create an instance of auth service', async () => {
    const module = await Test.createTestingModule({
        providers: [AuthService,{
            provide:UsersService,
            useValue:fakeUsersService,
        }, QrhistoricService]
    }).compile()

    const service=module.get(AuthService);
    expect(service).toBeDefined();

});