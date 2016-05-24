<?php

namespace nsNewsletter\Model;

use nsNewsletter\Config;

require_once('../Config/config.php');

/**
 * PDOSingleton class
 * @author Beno!t POLASZEK - 2013
 */
class PDOSingleton
{

    /**
     * Current Instance
     */
    private static $instance;

    /**
     * PDO object Instance
     */
    private $PDOInstance = null;

    /**
     * Constructor
     *
     * @param string $dsn : Data source name
     * @param string $username : User Name
     * @param string $password : User Password
     * @param string $driver_options : PDO Specific options
     *
*@return \nsNewsletter\Model\PDOSingleton PDOInstance
     */
    private function __construct($dsn, $username = null, $password = null, $driver_options = null)
    {
		try{
			$this->PDOInstance = new \PDO($dsn, $username, $password, $driver_options);
		} catch (\PDOException $e){
			die('<h1>Impossible de se connecter a la basede donnees!</h1>');
			//echo $e->getMessage();
		}
		
			
    }

    /**
     * Singleton call
     *
     * @return \PDO PDOInstance
     */
    public static function getConnect()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS, array(\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'));

        }

        return self::$instance;
    }

    /**
     * Prepares a SQL Query and executes it
     *
     * @param string $SqlString : SQL Query
     * @param array $SqlParams : PDO Params to bind
     * @return \PDOStatement Stmt
     */
    public function Sql($SqlString, array $SqlParams = array())
    {

        $Stmt = self::getConnect()->Prepare($SqlString);

        foreach ($SqlParams AS $Key => $Value) {
            $Stmt->BindValue(':' . $Key, $Value, self::PDOType($Value));
        }

        $Stmt->Execute();

        return $Stmt;

    }

    /**
     * SqlArray executes Query : returns the whole result set
     *
     * @param string $SqlString : SQL Query
     * @param array $SqlParams : PDO Params to bind
     * @return Array
     */
    public function SqlArray($SqlString, array $SqlParams = array())
    {
        return $this->Sql($SqlString, $SqlParams)->FetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * SqlLine executes Query : returns the 1st row of your result set
     *
     * @param string $SqlString : SQL Query
     * @param array $SqlParams : \PDO Params to bind
     * @return Array
     */
    public function SqlLine($SqlString, array $SqlParams = array())
    {
        return $this->Sql($SqlString, $SqlParams)->Fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * SqlValues executes Query : returns the 1st column of your result set
     *
     * @param string $SqlString : SQL Query
     * @param array $SqlParams : \PDO Params to bind
     * @return Array
     */
    public function SqlValues($SqlString, array $SqlParams = array())
    {
        return $this->Sql($SqlString, $SqlParams)->FetchAll(\PDO::FETCH_COLUMN);
    }

    /**
     * SqlValue executes Query : returns the 1st cell of your result set
     *
     * @param string $SqlString : SQL Query
     * @param array $SqlParams : \PDO Params to bind
     * @return String
     */
    public function SqlValue($SqlString, array $SqlParams = array())
    {
        return $this->Sql($SqlString, $SqlParams)->Fetch(\PDO::FETCH_COLUMN);
    }

    /**
     * Magic call - \PDO methods
     */
    public function __call($Method, $Args)
    {

        $Args = implode(', ', $Args);

        if ($Args) {
            return $this->PDOInstance->$Method($Args);
        } else {
            return $this->PDOInstance->$Method();
        }
    }

    /**
     * \PDO Automatic type binding
     *
     * @param $Var
     * @internal param mixed $var
     * @return int
     */
    private static function PDOType($Var)
    {

        switch (gettype($Var)) :

            case 'int'  :
            case 'integer'  :
                return \PDO::PARAM_INT;

            case 'double'   :
            case 'float'    :
                return \PDO::PARAM_STR; // No float \PDO type at the moment... :(

            case 'bool' :
            case 'boolean'  :
                return \PDO::PARAM_BOOL;

            case 'null' :
                return \PDO::PARAM_NULL;

            default :
                return \PDO::PARAM_STR;

        endswitch;

    }

}