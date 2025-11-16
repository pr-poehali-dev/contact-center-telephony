'''
Business: Управление звонками и маршрутизация на операторов
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict со списком звонков или результатом операции
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            cur.execute("""
                SELECT c.id, c.caller_number, u.full_name, c.status, c.duration, c.started_at, c.ended_at, c.notes
                FROM calls c
                LEFT JOIN users u ON c.operator_id = u.id
                ORDER BY c.started_at DESC
                LIMIT 100
            """)
            calls = cur.fetchall()
            
            result = []
            for call in calls:
                result.append({
                    'id': call[0],
                    'caller_number': call[1],
                    'operator_name': call[2],
                    'status': call[3],
                    'duration': call[4],
                    'started_at': call[5].isoformat() if call[5] else None,
                    'ended_at': call[6].isoformat() if call[6] else None,
                    'notes': call[7]
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
            action = body_data.get('action')
            
            if action == 'initiate':
                caller_number = body_data.get('caller_number')
                
                cur.execute(
                    "SELECT id FROM users WHERE status = 'online' AND role = 'operator' ORDER BY RANDOM() LIMIT 1"
                )
                operator = cur.fetchone()
                
                if operator:
                    cur.execute(
                        "INSERT INTO calls (caller_number, operator_id, status) VALUES (%s, %s, 'active') RETURNING id",
                        (caller_number, operator[0])
                    )
                    call_id = cur.fetchone()[0]
                    
                    cur.execute("UPDATE users SET status = 'busy' WHERE id = %s", (operator[0],))
                    
                    conn.commit()
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'call_id': call_id,
                            'operator_id': operator[0],
                            'message': 'Звонок направлен оператору'
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    cur.execute(
                        "INSERT INTO calls (caller_number, status) VALUES (%s, 'queued') RETURNING id",
                        (caller_number,)
                    )
                    call_id = cur.fetchone()[0]
                    conn.commit()
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            'call_id': call_id,
                            'message': 'Нет доступных операторов, звонок в очереди'
                        }),
                        'isBase64Encoded': False
                    }
            
            elif action == 'end':
                call_id = body_data.get('call_id')
                duration = body_data.get('duration', 0)
                notes = body_data.get('notes', '')
                
                cur.execute(
                    "UPDATE calls SET status = 'completed', ended_at = CURRENT_TIMESTAMP, duration = %s, notes = %s WHERE id = %s RETURNING operator_id",
                    (duration, notes, call_id)
                )
                result = cur.fetchone()
                
                if result and result[0]:
                    cur.execute("UPDATE users SET status = 'online' WHERE id = %s", (result[0],))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Звонок завершен'}),
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
