'''
Business: Управление пользователями (CRUD операции для супер-админа)
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict со списком пользователей или результатом операции
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute(
                "SELECT id, username, full_name, role, status, phone_extension, created_at FROM users ORDER BY id"
            )
            users = cur.fetchall()
            
            result = []
            for user in users:
                result.append({
                    'id': user[0],
                    'username': user[1],
                    'full_name': user[2],
                    'role': user[3],
                    'status': user[4],
                    'phone_extension': user[5],
                    'created_at': user[6].isoformat() if user[6] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            username = body_data.get('username')
            password = body_data.get('password')
            full_name = body_data.get('full_name')
            role = body_data.get('role', 'operator')
            phone_extension = body_data.get('phone_extension')
            
            cur.execute(
                "INSERT INTO users (username, password, full_name, role, phone_extension) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (username, password, full_name, role, phone_extension)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': user_id, 'message': 'Пользователь создан'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('id')
            
            update_fields = []
            values = []
            
            if 'username' in body_data:
                update_fields.append('username = %s')
                values.append(body_data['username'])
            if 'password' in body_data:
                update_fields.append('password = %s')
                values.append(body_data['password'])
            if 'full_name' in body_data:
                update_fields.append('full_name = %s')
                values.append(body_data['full_name'])
            if 'role' in body_data:
                update_fields.append('role = %s')
                values.append(body_data['role'])
            if 'status' in body_data:
                update_fields.append('status = %s')
                values.append(body_data['status'])
            if 'phone_extension' in body_data:
                update_fields.append('phone_extension = %s')
                values.append(body_data['phone_extension'])
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            values.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, values)
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Пользователь обновлен'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            user_id = params.get('id')
            
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Пользователь удален'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
