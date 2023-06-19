import Result from "./Result";
import Discipline from "./Discipline";
import Competition from "./Competition";
import User from "./User";

export default interface ResultSet {
    results: Result[],
    users: User[],
    disciplines: Discipline[],
    competitions: Competition[]
}