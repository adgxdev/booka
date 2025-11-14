export default function ForgotPasswordForm() {
    return (
        <div className="w-11/12 flex flex-col gap-y-5">
            <form>
                <input type="email" placeholder="Email or Phone number" className="w-full bg-white text-black placeholder-black rounded-lg py-4 px-3 mt-4 focus:outline-none" />
                <button type="submit" className="w-full bg-linear-to-r from-[#1A73E8] to-[#00C6FF] text-sm rounded-lg py-4 px-3 text-white mt-6">Reset Password</button>
            </form>
        </div>
    );
}